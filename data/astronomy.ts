export interface Planet {
  id: string;
  name: string;
  color: string;
  radius: number;
  distanceFromSun: number;
  orbitalPeriod: number;
  rotationPeriod: number;
  moons: number;
  description: string;
  symbol: string;
}

export const planets: Planet[] = [
  { id: 'mercury', name: 'Mercury', color: '#b5b5b5', radius: 2439.7, distanceFromSun: 57.9, orbitalPeriod: 88, rotationPeriod: 58.646, moons: 0, description: 'The smallest planet and closest to the Sun.', symbol: '☿' },
  { id: 'venus', name: 'Venus', color: '#e6c87a', radius: 6051.8, distanceFromSun: 108.2, orbitalPeriod: 225, rotationPeriod: 243.025, moons: 0, description: 'Earth\'s "sister planet" with a thick toxic atmosphere.', symbol: '♀' },
  { id: 'earth', name: 'Earth', color: '#6b93d6', radius: 6371, distanceFromSun: 149.6, orbitalPeriod: 365.25, rotationPeriod: 1, moons: 1, description: 'Our home planet, the only known world with life.', symbol: '🌍' },
  { id: 'mars', name: 'Mars', color: '#c1440e', radius: 3389.5, distanceFromSun: 227.9, orbitalPeriod: 687, rotationPeriod: 1.026, moons: 2, description: 'The Red Planet, a target for human exploration.', symbol: '♂' },
  { id: 'jupiter', name: 'Jupiter', color: '#d8ca9d', radius: 69911, distanceFromSun: 778.5, orbitalPeriod: 4333, rotationPeriod: 0.41, moons: 95, description: 'The largest planet, a gas giant.', symbol: '♃' },
  { id: 'saturn', name: 'Saturn', color: '#f4d59e', radius: 58232, distanceFromSun: 1432, orbitalPeriod: 10759, rotationPeriod: 0.45, moons: 146, description: 'Famous for its stunning ring system.', symbol: '♄' },
  { id: 'uranus', name: 'Uranus', color: '#b5e3e3', radius: 25362, distanceFromSun: 2867, orbitalPeriod: 30687, rotationPeriod: 0.72, moons: 28, description: 'An ice giant that rotates on its side.', symbol: '♅' },
  { id: 'neptune', name: 'Neptune', color: '#5b5ddf', radius: 24622, distanceFromSun: 4515, orbitalPeriod: 60190, rotationPeriod: 0.67, moons: 16, description: 'The windiest planet with supersonic storms.', symbol: '♆' }
];

export interface Constellation {
  id: string;
  name: string;
  abbreviation: string;
  brightestStar: string;
  bestMonth: number;
  mythology: string;
  stars: number;
  quadrant: string;
}

export const constellations: Constellation[] = [
  { id: 'orion', name: 'Orion', abbreviation: 'Ori', brightestStar: 'Rigel', bestMonth: 1, mythology: 'The Hunter. In Greek mythology, Orion was a giant huntsman whom Zeus placed among the stars.', stars: 7, quadrant: 'NQ1' },
  { id: 'ursa-major', name: 'Ursa Major', abbreviation: 'UMa', brightestStar: 'Alioth', bestMonth: 4, mythology: 'The Great Bear. Contains the Big Dipper asterism.', stars: 20, quadrant: 'NQ2' },
  { id: 'scorpius', name: 'Scorpius', abbreviation: 'Sco', brightestStar: 'Antares', bestMonth: 7, mythology: 'The Scorpion. Sent by Gaia to kill Orion.', stars: 18, quadrant: 'SQ3' },
  { id: 'leo', name: 'Leo', abbreviation: 'Leo', brightestStar: 'Regulus', bestMonth: 4, mythology: 'The Lion. Represents the Nemean Lion slain by Heracles.', stars: 9, quadrant: 'NQ2' },
  { id: 'cygnus', name: 'Cygnus', abbreviation: 'Cyg', brightestStar: 'Deneb', bestMonth: 9, mythology: 'The Swan. Represents Zeus in swan form.', stars: 9, quadrant: 'NQ4' },
  { id: 'cassiopeia', name: 'Cassiopeia', abbreviation: 'Cas', brightestStar: 'Schedar', bestMonth: 11, mythology: 'The Queen. Represents the vain queen Cassiopeia.', stars: 5, quadrant: 'NQ1' },
  { id: 'andromeda', name: 'Andromeda', abbreviation: 'And', brightestStar: 'Alpheratz', bestMonth: 11, mythology: 'The Princess. Andromeda was saved by Perseus.', stars: 16, quadrant: 'NQ1' },
  { id: 'gemini', name: 'Gemini', abbreviation: 'Gem', brightestStar: 'Pollux', bestMonth: 2, mythology: 'The Twins. Represents Castor and Pollux.', stars: 8, quadrant: 'NQ2' },
  { id: 'taurus', name: 'Taurus', abbreviation: 'Tau', brightestStar: 'Aldebaran', bestMonth: 1, mythology: 'The Bull. Represents Zeus in bull form.', stars: 19, quadrant: 'NQ1' },
  { id: 'virgo', name: 'Virgo', abbreviation: 'Vir', brightestStar: 'Spica', bestMonth: 5, mythology: 'The Maiden. Associated with Demeter.', stars: 15, quadrant: 'SQ3' },
  { id: 'sagittarius', name: 'Sagittarius', abbreviation: 'Sgr', brightestStar: 'Kaus Australis', bestMonth: 8, mythology: 'The Archer. Represents a centaur archer.', stars: 12, quadrant: 'SQ4' },
  { id: 'aquarius', name: 'Aquarius', abbreviation: 'Aqr', brightestStar: 'Sadalsuud', bestMonth: 10, mythology: 'The Water Bearer. Associated with Ganymede.', stars: 22, quadrant: 'SQ4' },
  { id: 'pisces', name: 'Pisces', abbreviation: 'Psc', brightestStar: 'Eta Piscium', bestMonth: 11, mythology: 'The Fish. Represents Aphrodite and Eros.', stars: 18, quadrant: 'NQ1' },
  { id: 'aries', name: 'Aries', abbreviation: 'Ari', brightestStar: 'Hamal', bestMonth: 12, mythology: 'The Ram. Represents the golden ram.', stars: 4, quadrant: 'NQ1' },
  { id: 'lyra', name: 'Lyra', abbreviation: 'Lyr', brightestStar: 'Vega', bestMonth: 8, mythology: 'The Lyre. Represents the lyre of Orpheus.', stars: 5, quadrant: 'NQ4' }
];

export interface Star {
  id: string;
  name: string;
  constellation: string;
  ra: number;
  dec: number;
  magnitude: number;
  distance: number;
  spectralClass: string;
  color: string;
}

export const brightestStars: Star[] = [
  { id: 'sirius', name: 'Sirius', constellation: 'Canis Major', ra: 101.28, dec: -16.72, magnitude: -1.46, distance: 8.6, spectralClass: 'A1V', color: '#a5c7f7' },
  { id: 'canopus', name: 'Canopus', constellation: 'Carina', ra: 95.99, dec: -52.70, magnitude: -0.74, distance: 310, spectralClass: 'A9II', color: '#fbf8e5' },
  { id: 'arcturus', name: 'Arcturus', constellation: 'Boötes', ra: 213.92, dec: 19.18, magnitude: -0.05, distance: 36.7, spectralClass: 'K1.5III', color: '#ffcc6f' },
  { id: 'vega', name: 'Vega', constellation: 'Lyra', ra: 279.23, dec: 38.78, magnitude: 0.03, distance: 25.04, spectralClass: 'A0V', color: '#c9d5f7' },
  { id: 'capella', name: 'Capella', constellation: 'Auriga', ra: 79.17, dec: 46.00, magnitude: 0.08, distance: 42.92, spectralClass: 'G3III', color: '#fff4e8' },
  { id: 'rigel', name: 'Rigel', constellation: 'Orion', ra: 78.63, dec: -8.20, magnitude: 0.13, distance: 860, spectralClass: 'B8Ia', color: '#a3c9f7' },
  { id: 'procyon', name: 'Procyon', constellation: 'Canis Minor', ra: 114.83, dec: 5.22, magnitude: 0.34, distance: 11.46, spectralClass: 'F5IV', color: '#fff8e0' },
  { id: 'betelgeuse', name: 'Betelgeuse', constellation: 'Orion', ra: 88.79, dec: 7.41, magnitude: 0.42, distance: 700, spectralClass: 'M1Ia', color: '#ff6b35' },
  { id: 'aldebaran', name: 'Aldebaran', constellation: 'Taurus', ra: 68.98, dec: 16.51, magnitude: 0.85, distance: 65.3, spectralClass: 'K5III', color: '#ffb56c' },
  { id: 'spica', name: 'Spica', constellation: 'Virgo', ra: 201.30, dec: -11.16, magnitude: 0.97, distance: 250, spectralClass: 'B1V', color: '#b5d5f7' }
];

export interface MeteorShower {
  id: string;
  name: string;
  peakDate: string;
  duration: number;
  zenithRatePerHour: number;
  constellation: string;
  speed: number;
  visibility: string;
}

export const meteorShowers: MeteorShower[] = [
  { id: 'quadrantids', name: 'Quadrantids', peakDate: '2024-01-04', duration: 2, zenithRatePerHour: 120, constellation: 'Boötes', speed: 41, visibility: 'Good (Crescent Moon)' },
  { id: 'lyrids', name: 'Lyrids', peakDate: '2024-04-22', duration: 3, zenithRatePerHour: 18, constellation: 'Lyra', speed: 49, visibility: 'Excellent (New Moon)' },
  { id: 'perseids', name: 'Perseids', peakDate: '2024-08-12', duration: 5, zenithRatePerHour: 100, constellation: 'Perseus', speed: 61, visibility: 'Excellent (New Moon)' },
  { id: 'orionids', name: 'Orionids', peakDate: '2024-10-21', duration: 3, zenithRatePerHour: 20, constellation: 'Orion', speed: 66, visibility: 'Fair (Quarter Moon)' },
  { id: 'leonids', name: 'Leonids', peakDate: '2024-11-17', duration: 3, zenithRatePerHour: 15, constellation: 'Leo', speed: 71, visibility: 'Poor (Full Moon)' },
  { id: 'geminids', name: 'Geminids', peakDate: '2024-12-14', duration: 4, zenithRatePerHour: 150, constellation: 'Gemini', speed: 35, visibility: 'Excellent (New Moon)' }
];

