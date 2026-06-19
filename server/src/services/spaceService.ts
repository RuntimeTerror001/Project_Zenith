import NodeCache from 'node-cache';
import * as zlib from 'zlib';

// Initialize cache: checkperiod of 120 seconds
const spaceCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

// Fallback datasets to ensure fail-safe service
const spaceEventsStatic = [
  {
    id: 'solar-eclipse-2026',
    name: 'Total Solar Eclipse 2026',
    type: 'eclipse',
    date: '2026-08-12',
    description: 'A spectacular total solar eclipse will sweep across the Arctic, Greenland, Iceland, Spain, and a small part of Portugal.',
    visibility: 'Visibile in Arctic, Greenland, Iceland, Spain',
    details: 'Longest duration of totality will be 2 minutes 18 seconds.'
  },
  {
    id: 'lunar-eclipse-aug-2026',
    name: 'Total Lunar Eclipse August 2026',
    type: 'eclipse',
    date: '2026-08-28',
    description: 'A total lunar eclipse where the Moon passes completely through Earth\'s dark shadow (umbra).',
    visibility: 'Visible in Americas, Europe, Africa',
    details: 'Totality will last 1 hour 31 minutes.'
  },
  {
    id: 'solar-eclipse-2027',
    name: 'Total Solar Eclipse 2027',
    type: 'eclipse',
    date: '2027-08-02',
    description: 'The longest total solar eclipse of the 21st century, path of totality crossing Spain, North Africa, and the Middle East.',
    visibility: 'Visible in Southern Europe, North Africa, Middle East',
    details: 'Totality will last a maximum of 6 minutes 23 seconds.'
  },
  {
    id: 'lunar-eclipse-mar-2026',
    name: 'Total Lunar Eclipse March 2026',
    type: 'eclipse',
    date: '2026-03-03',
    description: 'A total lunar eclipse visible across the Americas, East Asia, and Australia.',
    visibility: 'Visible in Americas, East Asia, Australia',
    details: 'Totality will last 58 minutes.'
  },
  {
    id: 'comet-tempel-2026',
    name: 'Comet 9P/Tempel Perihelion',
    type: 'comet',
    date: '2026-04-13',
    description: 'Periodic comet Tempel 1 reaches perihelion (closest point to the Sun) in its 5.5-year orbit.',
    visibility: 'Visible via telescope in the evening sky',
    details: 'First discovered in 1867, it was the target of NASA\'s Deep Impact mission in 2005.'
  },
  {
    id: 'conjunction-mars-jupiter-2026',
    name: 'Mars-Jupiter Conjunction',
    type: 'conjunction',
    date: '2026-11-16',
    description: 'Mars and Jupiter will make a close conjunction, appearing extremely close to each other in the morning sky.',
    visibility: 'Visible to the naked eye before sunrise',
    details: 'Separation of only 1.2 degrees, ideal for binoculars and astrophotography.'
  }
];

const fallbackEventsData = {
  nearEarthObjects: [
    { id: 'neo-433', name: '433 Eros', diameter: 16.84, velocity: 5.8, missDistance: 26000000, approachDate: '2026-06-19', hazardous: false },
    { id: 'neo-1036', name: '1036 Ganymed', diameter: 35.6, velocity: 14.2, missDistance: 54000000, approachDate: '2026-06-20', hazardous: false },
    { id: 'neo-99942', name: '99942 Apophis', diameter: 0.37, velocity: 7.4, missDistance: 31000, approachDate: '2029-04-13', hazardous: true }
  ],
  upcomingLaunches: [
    { id: 'launch-artemis-ii', name: 'Artemis II Crewed Test Flight', provider: 'NASA', rocket: 'Space Launch System (SLS) Block 1', location: 'LC-39B, Kennedy Space Center, Florida', launchDate: '2026-09-01T12:00:00Z', status: 'scheduled' },
    { id: 'launch-crew-10', name: 'SpaceX Crew-10', provider: 'SpaceX', rocket: 'Falcon 9 Block 5', location: 'LC-39A, Kennedy Space Center, Florida', launchDate: '2026-07-15T08:30:00Z', status: 'scheduled' },
    { id: 'launch-starship-ift', name: 'Starship Orbital Flight Test', provider: 'SpaceX', rocket: 'Starship Super Heavy', location: 'Starbase, Boca Chica, Texas', launchDate: '2026-06-30T13:00:00Z', status: 'ongoing' }
  ],
  auroraKpIndex: { level: 3, probability: 0.33, description: 'Quiet to unsettled conditions', forecast: 'Aurora likely visible at high latitudes only.' }
};

// In-memory compile states for stars
let compiledBinaryData: Buffer | null = null;
let compiledNamedStars: any[] | null = null;
let isCompilingStars = false;

// Simple CSV parser that handles quotes
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export class SpaceService {
  /**
   * Fetches ISS position from OpenNotify & WhereTheISS APIs
   */
  static async getIssPosition(): Promise<any> {
    const cached = spaceCache.get('iss_position');
    if (cached) return cached;

    try {
      const openNotifyPosPromise = fetch('http://api.opennotify.org/iss-now.json').then(r => r.json() as Promise<any>).catch(() => null);
      const openNotifyAstrosPromise = fetch('http://api.opennotify.org/astros.json').then(r => r.json() as Promise<any>).catch(() => null);
      const whereTheIssPromise = fetch('https://api.wheretheiss.at/v1/satellites/25544').then(r => r.json() as Promise<any>).catch(() => null);

      const [posData, astrosData, telemetryData] = await Promise.all([
        openNotifyPosPromise,
        openNotifyAstrosPromise,
        whereTheIssPromise
      ]);

      let latitude = 0;
      let longitude = 0;
      let altitude = 418.5;
      let velocity = 27580;
      let visibility = 'daylight';
      let timestamp = Math.floor(Date.now() / 1000);
      let positionFound = false;

      if (posData && posData.message === 'success') {
        latitude = parseFloat(posData.iss_position.latitude);
        longitude = parseFloat(posData.iss_position.longitude);
        timestamp = posData.timestamp;
        positionFound = true;
      }

      if (telemetryData) {
        if (!positionFound) {
          latitude = telemetryData.latitude;
          longitude = telemetryData.longitude;
          timestamp = telemetryData.timestamp;
          positionFound = true;
        }
        altitude = telemetryData.altitude;
        velocity = telemetryData.velocity;
        visibility = telemetryData.visibility;
      }

      if (!positionFound) {
        throw new Error('Unable to resolve ISS coordinates');
      }

      const crew: string[] = [];
      if (astrosData && astrosData.message === 'success') {
        const issCrew = astrosData.people
          .filter((p: any) => p.craft.toUpperCase() === 'ISS')
          .map((p: any) => p.name);
        crew.push(...issCrew);
      }

      if (crew.length === 0) {
        crew.push('Kjell Lindgren', 'Bob Hines', 'Jessica Watkins', 'Denis Matveev', 'Sergey Korsakov', 'Oleg Artemyev', 'Samantha Cristoforetti');
      }

      const payload = { latitude, longitude, altitude, velocity, visibility, timestamp, crew };
      // Cache for 3 seconds
      spaceCache.set('iss_position', payload, 3);
      return payload;
    } catch (error) {
      console.error('Error fetching ISS position:', error);
      throw error;
    }
  }

  /**
   * Fetches APOD from NASA
   */
  static async getApod(): Promise<any> {
    const cached = spaceCache.get('nasa_apod');
    if (cached) return cached;

    try {
      const key = process.env.NASA_API_KEY || 'DEMO_KEY';
      const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`);
      if (!res.ok) throw new Error('NASA API error');
      const data = await res.json() as any;
      const payload = { ...data, mediaType: data.media_type };
      spaceCache.set('nasa_apod', payload, 3600); // 1 hour cache
      return payload;
    } catch (error) {
      console.error('Error fetching APOD:', error);
      throw error;
    }
  }

  /**
   * Fetches spaceflight news
   */
  static async getSpaceNews(): Promise<any[]> {
    const cached = spaceCache.get('space_news') as any[];
    if (cached) return cached;

    try {
      const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=6&ordering=-published_at');
      if (!res.ok) throw new Error('Spaceflight News API error');
      const data = await res.json() as any;
      const payload = data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        imageUrl: item.image_url,
        url: item.url,
        newsSite: item.news_site,
        publishedAt: item.published_at
      }));
      spaceCache.set('space_news', payload, 1800); // 30 minutes cache
      return payload;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  /**
   * Fetches NEO, Upcoming Launches, Aurora Forecast, & Celestial Events
   */
  static async getLiveEvents(): Promise<any> {
    const cached = spaceCache.get('live_events');
    if (cached) return cached;

    try {
      const today = new Date().toISOString().slice(0, 10);
      const nasaKey = process.env.NASA_API_KEY || 'DEMO_KEY';

      const neoPromise = fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${nasaKey}`).then(r => r.ok ? r.json() as Promise<any> : null).catch(() => null);
      const launchPromise = fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=6').then(r => r.ok ? r.json() as Promise<any> : null).catch(() => null);
      const kpPromise = fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json').then(r => r.ok ? r.json() as Promise<any> : null).catch(() => null);

      const [neoData, launchData, kpData] = await Promise.all([
        neoPromise,
        launchPromise,
        kpPromise
      ]);

      if (!neoData && !launchData && !kpData) {
        throw new Error('All external events services failed');
      }

      let nearEarthObjects = fallbackEventsData.nearEarthObjects;
      if (neoData && neoData.near_earth_objects) {
        nearEarthObjects = Object.values(neoData.near_earth_objects).flat().map((item: any) => {
          const approach = item.close_approach_data[0];
          return {
            id: item.id,
            name: item.name,
            diameter: item.estimated_diameter.kilometers.estimated_diameter_max,
            velocity: Number(approach?.relative_velocity.kilometers_per_second ?? 0),
            missDistance: Number(approach?.miss_distance.kilometers ?? 0),
            approachDate: approach?.close_approach_date ?? today,
            hazardous: item.is_potentially_hazardous_asteroid
          };
        });
      }

      let upcomingLaunches = fallbackEventsData.upcomingLaunches;
      if (launchData && launchData.results) {
        upcomingLaunches = launchData.results.map((item: any) => ({
          id: item.id,
          name: item.name,
          provider: item.launch_service_provider?.name ?? 'Provider pending',
          rocket: item.rocket?.configuration?.full_name ?? 'Vehicle pending',
          location: item.pad?.location?.name ?? item.pad?.name ?? 'Location pending',
          launchDate: item.net,
          status: item.status?.id === 1 ? 'ongoing' : item.status?.id === 3 ? 'completed' : 'scheduled'
        }));
      }

      let auroraKpIndex = fallbackEventsData.auroraKpIndex;
      if (kpData && Array.isArray(kpData)) {
        const latestKp = Number(kpData.at(-1)?.[1] ?? 3);
        auroraKpIndex = {
          level: latestKp,
          probability: Math.min(latestKp / 9, 1),
          description: latestKp >= 5 ? 'Geomagnetic storm conditions' : 'Quiet to active geomagnetic conditions',
          forecast: latestKp >= 5 ? 'Aurora may be visible at lower latitudes.' : 'Aurora is most likely at high latitudes.'
        };
      }

      const payload = {
        nearEarthObjects,
        upcomingLaunches,
        auroraKpIndex,
        spaceEvents: spaceEventsStatic
      };

      spaceCache.set('live_events', payload, 900); // 15 mins cache
      return payload;
    } catch (error) {
      console.warn('Events API fetch failed. Using fallback data.', error);
      return {
        nearEarthObjects: fallbackEventsData.nearEarthObjects,
        upcomingLaunches: fallbackEventsData.upcomingLaunches,
        auroraKpIndex: fallbackEventsData.auroraKpIndex,
        spaceEvents: spaceEventsStatic
      };
    }
  }

  /**
   * Fetches satellite orbit catalogs
   */
  static async getSatellites(): Promise<any[]> {
    const cached = spaceCache.get('satellites') as any[];
    if (cached) return cached;

    try {
      const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle');
      if (!response.ok) throw new Error('Celestrak satellite catalog failure');
      
      const text = await response.text();
      const lines = text.split(/\r?\n/);
      const parsed: any[] = [];

      for (let i = 0; i < lines.length - 2; i += 3) {
        const name = lines[i]?.trim();
        const tle1 = lines[i + 1]?.trim();
        const tle2 = lines[i + 2]?.trim();

        if (name && tle1 && tle2 && tle1.startsWith('1 ') && tle2.startsWith('2 ')) {
          const id = tle1.substring(2, 7).trim();
          parsed.push({ id, name, tle1, tle2 });
        }
      }

      if (parsed.length === 0) throw new Error('Satellite catalogue parsing returned 0 entries');

      spaceCache.set('satellites', parsed, 43200); // 12 hours cache
      return parsed;
    } catch (error) {
      console.error('Error loading satellites:', error);
      throw error;
    }
  }

  /**
   * Fetches constellation lines
   */
  static async getConstellations(): Promise<any[]> {
    const cached = spaceCache.get('constellations') as any[];
    if (cached) return cached;

    try {
      const response = await fetch('https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json');
      if (!response.ok) throw new Error('Constellations fetch error');
      
      const data = await response.json() as any;
      const result: any[] = [];

      if (data && data.features) {
        for (const feature of data.features) {
          const id = feature.id || feature.properties?.abbr || '';
          const name = feature.properties?.name || '';
          const geom = feature.geometry;

          if (id && geom) {
            const lines: number[][][] = [];
            if (geom.type === 'LineString') {
              lines.push(geom.coordinates);
            } else if (geom.type === 'MultiLineString') {
              lines.push(...geom.coordinates);
            }
            result.push({ id, name, lines });
          }
        }
      }

      if (result.length === 0) throw new Error('No constellations parsed');

      spaceCache.set('constellations', result, 86400); // 24 hours cache
      return result;
    } catch (error) {
      console.warn('Constellations load failed. Returning Orion fallback.', error);
      const fallback = [
        {
          id: 'Ori',
          name: 'Orion',
          lines: [
            [[88.79, 7.41], [78.63, -8.20]]
          ]
        }
      ];
      return fallback;
    }
  }

  /**
   * Lazily loads and compiles the stars database (HYG v3, 117k stars)
   */
  static async compileStarsDatabase(): Promise<void> {
    if (isCompilingStars || (compiledBinaryData && compiledNamedStars)) return;
    isCompilingStars = true;

    try {
      console.log('Fetching HYG Stars database (this may take a few seconds)...');
      const response = await fetch('https://github.com/astronexus/HYG-Database/blob/main/hyg/v3/hyg_v38.csv.gz?raw=true');
      if (!response.ok) throw new Error('Failed to load HYG CSV database');

      const bufferData = await response.arrayBuffer();
      const decompressed = zlib.gunzipSync(Buffer.from(bufferData));
      const text = decompressed.toString('utf-8');
      const lines = text.split(/\r?\n/);
      if (lines.length <= 1) throw new Error('HYG Stars catalog is empty');

      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const raIndex = headers.indexOf('ra');
      const decIndex = headers.indexOf('dec');
      const magIndex = headers.indexOf('mag');
      const nameIndex = headers.indexOf('proper');

      const parsedStars: Array<{ ra: number; dec: number; mag: number; name?: string }> = [];
      const namedStars: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        const cols = parseCsvLine(line);
        const raHours = parseFloat(cols[raIndex] || '');
        const dec = parseFloat(cols[decIndex] || '');
        const mag = parseFloat(cols[magIndex] || '');
        const name = cols[nameIndex]?.trim();

        if (!isNaN(raHours) && !isNaN(dec) && !isNaN(mag)) {
          const ra = raHours * 15; // Hours to degrees (0 to 360)
          parsedStars.push({ ra, dec, mag, name: name || undefined });

          if (name) {
            namedStars.push({ name, ra, dec, mag });
          }
        }
      }

      // Compile into binary buffer (6 bytes per star)
      const buffer = Buffer.alloc(parsedStars.length * 6);
      for (let idx = 0; idx < parsedStars.length; idx++) {
        const star = parsedStars[idx];
        const offset = idx * 6;

        const raVal = Math.round((star.ra * 65535) / 360);
        const decVal = Math.round(((star.dec + 90) * 65535) / 180);
        const magVal = Math.round(star.mag * 100);

        buffer.writeUInt16LE(Math.max(0, Math.min(65535, raVal)), offset);
        buffer.writeUInt16LE(Math.max(0, Math.min(65535, decVal)), offset + 2);
        buffer.writeInt16LE(Math.max(-32768, Math.min(32767, magVal)), offset + 4);
      }

      compiledBinaryData = buffer;
      compiledNamedStars = namedStars;
      console.log(`Successfully compiled ${parsedStars.length} stars into binary cache.`);
    } catch (error) {
      console.error('Error compiling stars database:', error);
    } finally {
      isCompilingStars = false;
    }
  }

  static getCompiledStarsBinary(): Buffer | null {
    return compiledBinaryData;
  }

  static getCompiledStarsNames(): any[] | null {
    return compiledNamedStars;
  }
}
