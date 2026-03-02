import React, { useState, useEffect } from 'react';

interface JamaatPrayer {
    id: number;
    name: string;
    name_bn: string;
    time: string;
    timeValue: number;
}

export function PrayerTimes() {
    const [jamaatPrayers, setJamaatPrayers] = useState<JamaatPrayer[]>([]);
    const [upcoming, setUpcoming] = useState<JamaatPrayer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/prayer-times')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const prayers = data.data.fard.jamaat.map((p: any) => {
                        // Convert "5:30 AM" to minutes for comparison
                        const timeStr = p.time;
                        const [time, period] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':').map(Number);
                        
                        if (period === 'PM' && hours !== 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                        
                        const timeValue = hours * 60 + minutes;
                        
                        return {
                            id: p.id,
                            name: p.display_name_en.replace(' Jamaat', ''),
                            name_bn: p.display_name_bn.replace(' জামাত', ''),
                            time: p.time,
                            timeValue
                        };
                    });
                    
                    setJamaatPrayers(prayers);
                    
                    // Find upcoming
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    
                    const sorted = [...prayers].sort((a, b) => a.timeValue - b.timeValue);
                    const next = sorted.find(p => p.timeValue > currentMinutes) || sorted[0];
                    setUpcoming(next);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <section className="bg-white py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Upcoming Prayer */}
                {upcoming && (
                    <div className="mb-6 bg-emerald-600 text-white p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">পরবর্তী জামাত:</span>
                            <span className="text-xl font-bold">{upcoming.name_bn} - {upcoming.time}</span>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-emerald-900">জামাতের সময়সূচী</h2>
                    <a href="/prayer-times" className="text-emerald-600 hover:text-emerald-800">
                        সকল ওয়াক্ত →
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {jamaatPrayers.map((prayer) => (
                        <div key={prayer.id} className={`bg-emerald-50 p-4 rounded-lg ${
                            upcoming?.id === prayer.id ? 'ring-2 ring-emerald-500' : ''
                        }`}>
                            <h3 className="font-semibold text-center">
                                {prayer.name}
                                <span className="block text-sm text-gray-600">{prayer.name_bn}</span>
                            </h3>
                            <p className="text-xl font-bold text-emerald-800 text-center mt-2">
                                {prayer.time}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}