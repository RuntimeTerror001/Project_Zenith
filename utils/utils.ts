import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  if (km < 1000) return `${km.toFixed(2)} km`;
  if (km < 1000000) return `${(km / 1000).toFixed(2)} Mm`;
  if (km < 149597870.7) return `${(km / 1000000).toFixed(2)} Gm`;
  return `${(km / 149597870.7).toFixed(4)} AU`;
}

export function formatSpeed(kmPerSec: number): string {
  return `${kmPerSec.toFixed(2)} km/s`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const celestialEvents = [
  { name: 'Apollo 11 Moon Landing', date: '1969-07-20', description: 'First humans walk on the Moon' },
  { name: 'Halley\'s Comet Closest Approach', date: '1986-02-09', description: 'Halley\'s Comet perihelion' },
  { name: 'Great Solar Eclipse', date: '2017-08-21', description: 'Total solar eclipse across USA' },
  { name: 'Great Conjunction', date: '2020-12-21', description: 'Jupiter and Saturn at closest approach' },
];

export const bayerConstellations = [
  'Andromeda', 'Antlia', 'Apus', 'Aquarius', 'Aquila', 'Ara', 'Aries', 'Auriga', 'Boötes', 'Caelum',
  'Camelopardalis', 'Cancer', 'Canes Venatici', 'Canis Major', 'Canis Minor', 'Capricornus', 'Carina',
  'Cassiopeia', 'Centaurus', 'Cepheus', 'Cetus', 'Chamaeleon', 'Circinus', 'Columba', 'Coma Berenices',
  'Corona Australis', 'Corona Borealis', 'Corvus', 'Crater', 'Crux', 'Cygnus', 'Delphinus', 'Dorado',
  'Draco', 'Equuleus', 'Eridanus', 'Fornax', 'Gemini', 'Grus', 'Hercules', 'Horologium', 'Hydra',
  'Hydrus', 'Indus', 'Lacerta', 'Leo', 'Leo Minor', 'Lepus', 'Libra', 'Lupus', 'Lynx', 'Lyra',
  'Mensa', 'Microscopium', 'Monoceros', 'Musca', 'Norma', 'Octans', 'Ophiuchus', 'Orion', 'Pavo',
  'Pegasus', 'Perseus', 'Phoenix', 'Pictor', 'Pisces', 'Piscis Austrinus', 'Puppis', 'Pyxis',
  'Reticulum', 'Sagitta', 'Sagittarius', 'Scorpius', 'Sculptor', 'Scutum', 'Serpens', 'Sextans',
  'Taurus', 'Telescopium', 'Triangulum', 'Triangulum Australe', 'Tucana', 'Ursa Major', 'Ursa Minor',
  'Vela', 'Virgo', 'Volans', 'Vulpecula'
];
