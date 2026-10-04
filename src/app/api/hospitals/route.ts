import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

type Hospital = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function firstSuccess<T>(tasks: Array<() => Promise<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    let failed = 0;
    let lastErr: unknown = new Error("no tasks");
    tasks.forEach((task) => {
      task()
        .then(resolve)
        .catch((e) => {
          lastErr = e;
          failed++;
          if (failed === tasks.length) reject(lastErr);
        });
    });
  });
}

async function viaOverpass(
  endpoint: string,
  bbox: string,
  signal: AbortSignal
): Promise<{ source: string; list: Hospital[] }> {
  const query =
    "[out:json][timeout:12];" +
    'nwr["amenity"="hospital"](' + bbox + ");" +
    "out center tags 80;";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "synapse-ai/1.0",
    },
    body: new URLSearchParams({ data: query }).toString(),
    signal: signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Overpass " + res.status);
  const data = await res.json();
  const list: Hospital[] = ((data.elements ?? []) as any[])
    .map((el) => {
      const t = el.tags ?? {};
      return {
        id: el.type + "/" + el.id,
        name: t["name:ar"] ?? t.name ?? t["name:en"],
        lat: el.lat ?? el.center?.lat,
        lon: el.lon ?? el.center?.lon,
        address: t["addr:street"] ?? t["addr:city"] ?? undefined,
      };
    })
    .filter((h) => h.name && h.lat != null && h.lon != null);
  if (list.length === 0) throw new Error("Overpass empty");
  return { source: "overpass", list: list };
}

async function viaNominatim(
  west: number,
  north: number,
  east: number,
  south: number,
  signal: AbortSignal
): Promise<{ source: string; list: Hospital[] }> {
  const url =
    "https://nominatim.openstreetmap.org/search?q=hospital&format=jsonv2" +
    "&limit=50&bounded=1&accept-language=ar" +
    "&viewbox=" + west + "," + north + "," + east + "," + south;
  const res = await fetch(url, {
    headers: { "User-Agent": "synapse-ai/1.0" },
    signal: signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Nominatim " + res.status);
  const data = (await res.json()) as any[];
  const list: Hospital[] = data
    .map((r) => ({
      id: "nominatim/" + r.place_id,
      name: r.name ?? String(r.display_name ?? "").split(",")[0],
      lat: Number(r.lat),
      lon: Number(r.lon),
      address: undefined,
    }))
    .filter((h) => h.name && Number.isFinite(h.lat) && Number.isFinite(h.lon));
  if (list.length === 0) throw new Error("Nominatim empty");
  return { source: "nominatim", list: list };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const radiusRaw = Number(sp.get("radius"));
  const radius = Math.min(
    Math.max(Number.isFinite(radiusRaw) && radiusRaw > 0 ? radiusRaw : 20000, 1000),
    30000
  );

  const valid =
    sp.has("lat") && sp.has("lon") && Number.isFinite(lat) && Number.isFinite(lon);
  if (!valid) {
    return NextResponse.json({ error: "lat و lon مطلوبان" }, { status: 400 });
  }
  const dLat = radius / 111000;
  const dLon = radius / (111000 * Math.cos((lat * Math.PI) / 180));
  const south = lat - dLat;
  const north = lat + dLat;
  const west = lon - dLon;
  const east = lon + dLon;
  const bbox = south + "," + west + "," + north + "," + east;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 15000);

  try {
    const tasks: Array<() => Promise<{ source: string; list: Hospital[] }>> = [
      ...OVERPASS.map((ep) => () => viaOverpass(ep, bbox, ac.signal)),
      () => viaNominatim(west, north, east, south, ac.signal),
    ];
    const result = await firstSuccess(tasks);

    const hospitals = result.list
      .map((h) => ({
        ...h,
        distance_km: Math.round(distanceKm(lat, lon, h.lat, h.lon) * 100) / 100,
      }))
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 10);

    return NextResponse.json({
      count: hospitals.length,
      source: result.source,
      hospitals: hospitals,
    });
  } catch (err) {
    console.error("[api/hospitals] all sources failed:", err);
    return NextResponse.json(
      { error: "تعذّر الوصول إلى خدمات الخرائط الآن. تحقق من الإنترنت وحاول مجدداً." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timer);
    ac.abort();
  }
}