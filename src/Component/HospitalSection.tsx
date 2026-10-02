const findNearbyHospitals = () => {
  if (!navigator.geolocation) {
    alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // استدعاء مسار الـ API
      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      console.log('أقرب المستشفيات الحقيقية:', data.hospitals);
      
      // هنا تقوم بتخزين النتائج في الـ State لعرضها للمستخدم، مثلاً:
      // setHospitals(data.hospitals);
    },
    (error) => {
      alert('يرجى السماح بالوصول للموقع الجغرافي لعرض المستشفيات القريبة بدقة.');
    },
    { enableHighAccuracy: true }
  );
};