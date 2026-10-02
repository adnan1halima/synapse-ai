import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const TOTAL_BUDGET_MS = 24_000;
const PER_ATTEMPT_MS = 10_000;
const MIN_RADIUS = 500;
const MAX_RADIUS = 30_000;
const DEFAULT_RADIUS = 5_000;

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type Hospital = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  phone?: string;
  website?: string;
  address?: string;
  emergency?: boolean;
};

function json(body: unknown, status = 200, cache = "no-store") {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": cache },
  });
}

function buildQuery(lat: number, lon: number, radius: number) {
  return `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      relation["amenity"="hospital"](around:${radius},${lat},${lon});
    );
    out center tags 60;
  `;
}

async function fetchOverpass(query: string): Promise<OverpassElement[]> {
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let lastError: unknown = new Error("No endpoints available");

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const remaining = deadline - Date.now();
    if (remaining < 1_500) break;

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.min(PER_ATTEMPT_MS, remaining)
    );

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "synapse-ai/1.0 (contact: your-email@example.com)",
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Overpass responded ${res.status}`);
      }

      const data = (await res.json()) as { elements?: OverpassElement[] };
      return data.elements ?? [];
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

function normalize(elements: OverpassElement[]): Hospital[] {
  const result: Hospital[] = [];

  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;

    const t = el.tags ?? {};
    const address = [t["addr:street"], t["addr:housenumber"], t["addr:city"]]
      .filter(Boolean)
      .join(", ");

    result.push({
      id: `${el.type}/${el.id}`,
      name: t["name:ar"] || t.name || t["name:en"] || "مستشفى",
      lat,
      lon,
      phone: t.phone || t["contact:phone"],
      website: t.website || t["contact:website"],
      address: address || undefined,
      emergency: t.emergency === "yes",
    });
  }

  return result;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const radiusParam = sp.get("radius");
  const radius = Math.min(
    Math.max(radiusParam ? Number(radiusParam) : DEFAULT_RADIUS, MIN_RADIUS),
    MAX_RADIUS
  );

  if (
    !sp.has("lat") ||
    !sp.has("lon") ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180 ||
    !Number.isFinite(radius)
  ) {
    return json({ error: "معاملات غير صالحة: lat و lon مطلوبان." }, 400);
  }

  try {
    const elements = await fetchOverpass(buildQuery(lat, lon, radius));
    const hospitals = normalize(elements);

    return json(
      { count: hospitals.length, radius, hospitals },
      200,
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.error("[api/hospitals] failed:", err);

    return json(
      {
        error: isTimeout
          ? "انتهت مهلة الاتصال بخدمة الخرائط، حاول مجدداً."
          : "تعذّر جلب بيانات المستشفيات حالياً.",
      },
      isTimeout ? 504 : 502
    );
  }
}