export interface PlanetPosition {
  name: string;
  ra: number; // degrees
  dec: number; // degrees
  distance: number; // AU
  azimuth: number; // degrees
  elevation: number; // degrees
  visible: boolean;
}

// Convert Date object to Julian Date
export function getJulianDate(date: Date): number {
  const time = date.getTime();
  // Julian Date relative to 1970-01-01T00:00:00Z (which is JD 2440587.5)
  return 2440587.5 + time / 86400000;
}

// Greenwich Mean Sidereal Time in degrees
export function getGMST(jd: number): number {
  const d = jd - 2451545.0;
  const t = d / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38710000.0;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  return gmst;
}

// Local Sidereal Time in degrees
export function getLST(jd: number, longitude: number): number {
  let lst = getGMST(jd) + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;
  return lst;
}

// Convert Right Ascension (RA) and Declination (Dec) to Azimuth (Az) and Elevation (El)
export function raDecToAzEl(
  ra: number, // degrees
  dec: number, // degrees
  lat: number, // degrees
  lng: number, // degrees
  date: Date
): { azimuth: number; elevation: number } {
  const jd = getJulianDate(date);
  const lst = getLST(jd, lng);

  // Hour Angle in degrees
  let ha = lst - ra;
  if (ha < -180) ha += 360;
  if (ha > 180) ha -= 360;

  const haRad = (ha * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Sin(Elevation)
  const sinEl = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinEl)));
  const elevation = (elevationRad * 180) / Math.PI;

  // Cos(Azimuth)
  const cosEl = Math.cos(elevationRad);
  let azimuth = 0;

  if (Math.abs(cosEl) > 1e-6) {
    const cosAz = (Math.sin(decRad) - Math.sin(elevationRad) * Math.sin(latRad)) / (cosEl * Math.cos(latRad));
    const azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
    azimuth = (azRad * 180) / Math.PI;
    if (Math.sin(haRad) > 0) {
      azimuth = 360 - azimuth;
    }
  } else {
    // Zenith or Nadir
    azimuth = 0;
  }

  return { azimuth, elevation };
}

// Keplerian orbital elements of the planets at J2000 (relative to Sun)
// and their rate of change per century (cy).
// Values compiled from JPL Keplerian Elements tables.
interface KeplerianElements {
  a: number; // semi-major axis (AU)
  a_dot: number;
  e: number; // eccentricity
  e_dot: number;
  i: number; // inclination (degrees)
  i_dot: number;
  L: number; // mean longitude (degrees)
  L_dot: number;
  longPeri: number; // longitude of perihelion (degrees)
  longPeri_dot: number;
  longNode: number; // longitude of ascending node (degrees)
  longNode_dot: number;
}

const planetElements: Record<string, KeplerianElements> = {
  mercury: {
    a: 0.38709893, a_dot: 0.0,
    e: 0.20563069, e_dot: 0.0000204,
    i: 7.00487, i_dot: -0.00594,
    L: 252.25084, L_dot: 149472.67411,
    longPeri: 77.45645, longPeri_dot: 0.15901,
    longNode: 48.33167, longNode_dot: -0.12537,
  },
  venus: {
    a: 0.72333199, a_dot: 0.0,
    e: 0.00677323, e_dot: -0.00004776,
    i: 3.39471, i_dot: -0.000788,
    L: 181.97973, L_dot: 58517.81538,
    longPeri: 131.53298, longPeri_dot: 0.00213,
    longNode: 76.68069, longNode_dot: -0.27769,
  },
  earth: { // Earth-Moon Barycenter
    a: 1.00000011, a_dot: 0.0,
    e: 0.01671022, e_dot: -0.00003804,
    i: 0.00005, i_dot: -0.013,
    L: 100.46435, L_dot: 35999.372449,
    longPeri: 102.94719, longPeri_dot: 0.32225,
    longNode: -11.26064, longNode_dot: -0.44522,
  },
  mars: {
    a: 1.52366231, a_dot: 0.0,
    e: 0.09341233, e_dot: 0.00011902,
    i: 1.85061, i_dot: -0.00724,
    L: 355.45332, L_dot: 19140.302684,
    longPeri: 336.04084, longPeri_dot: 0.44383,
    longNode: 49.57854, longNode_dot: -0.29257,
  },
  jupiter: {
    a: 5.20336301, a_dot: 0.00060737,
    e: 0.04839266, e_dot: -0.0001288,
    i: 1.3053, i_dot: -0.00415,
    L: 34.40438, L_dot: 3034.74612,
    longPeri: 14.75385, longPeri_dot: 0.19111,
    longNode: 100.55615, longNode_dot: 0.20397,
  },
  saturn: {
    a: 9.53707032, a_dot: -0.0030153,
    e: 0.0541506, e_dot: -0.00036762,
    i: 2.48446, i_dot: 0.00193,
    L: 49.94432, L_dot: 1222.11379,
    longPeri: 92.43194, longPeri_dot: -0.41897,
    longNode: 113.71504, longNode_dot: -0.36214,
  },
  uranus: {
    a: 19.19126393, a_dot: 0.00152025,
    e: 0.04716771, e_dot: -0.0001915,
    i: 0.76986, i_dot: -0.00269,
    L: 313.23218, L_dot: 428.48202,
    longPeri: 170.96424, longPeri_dot: 0.40805,
    longNode: 74.22988, longNode_dot: -0.20905,
  },
  neptune: {
    a: 30.06896348, a_dot: -0.00125196,
    e: 0.00858587, e_dot: 0.00002514,
    i: 1.76917, i_dot: -0.000974,
    L: 304.88003, L_dot: 218.45945,
    longPeri: 44.97135, longPeri_dot: -0.32241,
    longNode: 131.72169, longNode_dot: -0.00256,
  },
};

// Calculate heliocentric coordinates (X, Y, Z relative to the Sun)
function getHeliocentricCoordinates(planet: string, cy: number) {
  const el = planetElements[planet];
  if (!el) return { x: 0, y: 0, z: 0 };

  const a = el.a + el.a_dot * cy;
  const e = el.e + el.e_dot * cy;
  const i = ((el.i + el.i_dot * cy) * Math.PI) / 180;
  const L = ((el.L + el.L_dot * cy) * Math.PI) / 180;
  const longPeri = ((el.longPeri + el.longPeri_dot * cy) * Math.PI) / 180;
  const longNode = ((el.longNode + el.longNode_dot * cy) * Math.PI) / 180;

  const M = L - longPeri;
  const w = longPeri - longNode;

  // Solve Kepler's equation M = E - e*sin(E) by iteration
  let E = M;
  for (let step = 0; step < 5; step++) {
    E = M + e * Math.sin(E);
  }

  // Coordinates in plane of orbit
  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Transform to ecliptic coordinates
  const cosNode = Math.cos(longNode);
  const sinNode = Math.sin(longNode);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  const x = xPrime * (cosNode * cosW - sinNode * sinW * cosI) - yPrime * (cosNode * sinW + sinNode * cosW * cosI);
  const y = xPrime * (sinNode * cosW + cosNode * sinW * cosI) - yPrime * (sinNode * sinW - cosNode * cosW * cosI);
  const z = xPrime * (sinW * sinI) + yPrime * (cosW * sinI);

  return { x, y, z };
}

// Calculate geocentric coordinates and RA/Dec for a planet
export function getPlanetHorizontalPosition(
  planet: string,
  date: Date,
  lat: number,
  lng: number
): PlanetPosition {
  const jd = getJulianDate(date);
  const cy = (jd - 2451545.0) / 36525.0;

  // Get heliocentric coordinates of the planet
  const helio = getHeliocentricCoordinates(planet, cy);

  // Get heliocentric coordinates of Earth
  const earthHelio = getHeliocentricCoordinates('earth', cy);

  // Geocentric coordinates (vector from Earth to planet)
  const gx = helio.x - earthHelio.x;
  const gy = helio.y - earthHelio.y;
  const gz = helio.z - earthHelio.z;

  const distance = Math.sqrt(gx * gx + gy * gy + gz * gz);

  // Convert Ecliptic coordinates to Equatorial coordinates
  // Obliquity of the ecliptic
  const epsilon = ((23.439291 - 0.0130042 * cy) * Math.PI) / 180;
  const cosEps = Math.cos(epsilon);
  const sinEps = Math.sin(epsilon);

  const eqX = gx;
  const eqY = gy * cosEps - gz * sinEps;
  const eqZ = gy * sinEps + gz * cosEps;

  // Convert to RA and Dec
  let raRad = Math.atan2(eqY, eqX);
  if (raRad < 0) raRad += 2 * Math.PI;
  const decRad = Math.atan2(eqZ, Math.sqrt(eqX * eqX + eqY * eqY));

  const ra = (raRad * 180) / Math.PI;
  const dec = (decRad * 180) / Math.PI;

  // Convert to Azimuth / Elevation
  const { azimuth, elevation } = raDecToAzEl(ra, dec, lat, lng, date);

  return {
    name: planet.charAt(0).toUpperCase() + planet.slice(1),
    ra,
    dec,
    distance,
    azimuth,
    elevation,
    visible: elevation > 0,
  };
}
