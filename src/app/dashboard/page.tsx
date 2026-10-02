'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_in_km: number;
}

export default function DashboardPage() {
  // التبويب النشط: 'hospitals' لعرض خيار المستشفيات فوراً
  const [activeTab, setActiveTab] = useState<'overview' | 'hospitals'>('hospitals');
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 100) / 100;
  };

  const fetchHospitals = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);

      const { data: localData, error: dbError } = await supabase.rpc('get_nearby_hospitals', {
        user_lat: lat,
        user_long: lng,
      });

      if (!dbError && localData && localData.length > 0) {
        setHospitals(localData);
        setLoading(false);
        return;
      }

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:40000, ${lat}, ${lng});
          way["amenity"="hospital"](around:40000, ${lat}, ${lng});
        );
        out center;
      `;

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('فشل في جلب البيانات الجغرافية');
      
      const result = await response.json();

      const filteredHospitals: Hospital[] = result.elements
        .filter((item: any) => {
          const tags = item.tags || {};
          const name = tags.name || tags['name:ar'] || tags['name:en'];
          if (!name) return false;
          const lowerName = name.toLowerCase();
          return !(
            lowerName.includes('صيدلية') || 
            lowerName.includes('pharmacy') || 
            lowerName.includes('بيطري') || 
            lowerName.includes('أسنان')
          );
        })
        .map((item: any) => {
          const hLat = item.lat || (item.center && item.center.lat);
          const hLng = item.lon || (item.center && item.center.lon);
          const tags = item.tags || {};
          return {
            id: item.id.toString(),
            name: tags.name || tags['name:ar'] || tags['name:en'],
            address: tags['addr:street'] || tags['addr:city'] || tags['addr:district'] || 'المستشفى المركزي / المركز الطبي',
            latitude: hLat,
            longitude: hLng,
            distance_in_km: calculateHaversineDistance(lat, lng, hLat, hLng)
          };
        })
        .filter((h: Hospital) => h.latitude && h.longitude)
        .sort((a: Hospital, b: Hospital) => a.distance_in_km - b.distance_in_km);

      const uniqueHospitals = Array.from(
        new Map(filteredHospitals.map(item => [item.name, item])).values()
      ).slice(0, 10);

      setHospitals(uniqueHospitals);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع الجغرافي');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchHospitals(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('يرجى السماح بالوصول لموقعك الجغرافي لترتيب المستشفيات حسب الأقرب.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans dir-rtl">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-teal-400">SYNAPSE AI</h1>
            <p className="text-slate-400 mt-1">منظومة الخدمات الطبية الذكية</p>
          </div>
        </header>

        {/* أزرار التبديل الخيارات القابلة للاختيار */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'hospitals'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🏥 أقرب المستشفيات (GPS)
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            📊 لوحة التحكم العامة
          </button>
        </div>

        {/* محتوى خيار المستشفيات */}
        {activeTab === 'hospitals' && (
          <div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-300">جاري تحليل موقعك وجلب أقرب 10 مستشفيات بدقة...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {!loading && !error && hospitals.length === 0 && (
              <div className="text-center py-12 text-slate-400 bg-slate-800/40 rounded-xl border border-slate-800">
                لم يتم العثور على مستشفيات رئيسية مطابقة ضمن نطاقك الجغرافي الحالي.
              </div>
            )}

            {!loading && hospitals.length > 0 && (
              <div className="grid gap-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">
                  أقرب {hospitals.length} مستشفيات لموقعك الحالي:
                </h2>
                {hospitals.map((hospital, index) => (
                  <div 
                    key={hospital.id || index}
                    className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-xl hover:border-teal-500/50 transition-all flex justify-between items-center shadow-lg"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-teal-300 mb-1">{hospital.name}</h3>
                      <p className="text-sm text-slate-400">{hospital.address}</p>
                    </div>
                    <div className="text-left shrink-0 mr-4">
                      <span className="inline-block bg-teal-950 text-teal-300 text-sm font-semibold px-3 py-1 rounded-full border border-teal-800/50">
                        {hospital.distance_in_km} كم
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-slate-400 hover:text-teal-400 mt-2 underline text-center"
                      >
                        اتجاهات القيادة ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* محتوى اللوحة العامة */}
        {activeTab === 'overview' && (
          <div className="bg-slate-800/40 border border-slate-800 p-8 rounded-2xl text-center text-slate-400">
            مرحباً بك في لوحة التحكم الرئيسية لـ SYNAPSE AI.
          </div>
        )}
      </div>
    </div>
  );
}