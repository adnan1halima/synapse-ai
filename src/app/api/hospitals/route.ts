export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'الإحداثيات غير متوفرة' }, { status: 400 });
    }

    const radius = 10000;
    const overpassQuery = `
      [out:json];
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      out body 10;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('فشل الاستجابة من الخادم الخارجي');
    }

    const data = await response.json();
    
    const hospitals = (data.elements || []).map((place: any) => ({
      name: place.tags?.name || place.tags?.['name:ar'] || 'مستشفى محلي',
      address: place.tags?.['addr:street'] || 'قريب من موقعك الحالي',
      rating: 'متاح',
      isOpen: '24 ساعة',
      location: { lat: place.lat, lng: place.lon },
      placeId: place.id
    }));

    return NextResponse.json({ hospitals });
  } catch (error) {
    return NextResponse.json({ hospitals: [], warning: 'تعذر جلب المستشفيات حالياً' });
  }
}