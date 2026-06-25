import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// In-memory cache
let cachedData: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

export async function GET() {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    const response = await fetch(
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
      { cache: 'no-store' } // Response is >2MB, skip Next.js data cache; use our in-memory cache
    );

    if (!response.ok) {
      throw new Error(`CelesTrak responded with ${response.status}`);
    }

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

    if (parsed.length === 0) {
      throw new Error('Satellite catalogue parsing returned 0 entries');
    }

    // Update cache
    cachedData = parsed;
    cacheTimestamp = now;

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.warn('Error loading satellites from CelesTrak, trying local fallback:', error.message);

    // Try reading from local server cache file
    try {
      const dataFilePath = path.resolve(process.cwd(), 'server', 'data', 'satellites.json');
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && parsed.length > 0) {
          cachedData = parsed;
          cacheTimestamp = now;
          return NextResponse.json(parsed);
        }
      }
    } catch (fallbackError: any) {
      console.error('Local satellites file fallback failed:', fallbackError.message);
    }

    // Return cached data even if expired on error
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    return NextResponse.json(
      { error: 'Failed to fetch satellite data from CelesTrak' },
      { status: 502 }
    );
  }
}
