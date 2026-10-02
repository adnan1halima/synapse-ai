export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // استخراج الإحصائيات بطريقة آمنة لا تكسر البناء أبداً
    const urlObj = new URL(req.url, 'http://localhost');
    const lat = urlObj.searchParams.get('lat');
    const lng = urlObj.searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ hospitals: [], error: 'الإحداثيات غير متوفرة' }, { status: 400 });
    }

    const radius = 10000;
    const overpassQuery = `
      [out:json];
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      out body 10;
    `;

    const externalUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    const response = await fetch(externalUrl, {
      headers: { 'User-Agent': 'MedicalTriageApp/1.0' }
    });

    if (!response.ok) {
      return NextResponse.json({ hospitals: [] });
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
  } catch (err) {
    return NextResponse.json({ hospitals: [] });
  }
}