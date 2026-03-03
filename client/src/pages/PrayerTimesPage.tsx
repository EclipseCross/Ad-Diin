import React, { useState, useEffect } from 'react';

// Interface for prayer data from API
interface ApiPrayer {
    id: number;
    prayer_name: string;
    display_name_en: string;
    display_name_bn: string;
    time: string;  // This is the formatted time (e.g., "5:00 AM")
    prayer_time: string;
    category: string;
    prayer_type: string;
    display_order: number;
}

// Interface for display
interface DisplayPrayer {
    id: number;
    name_en: string;
    name_bn: string;
    time: string;
}

export default function PrayerTimesPage() {
    const [fardAzan, setFardAzan] = useState<DisplayPrayer[]>([]);
    const [fardJamaat, setFardJamaat] = useState<DisplayPrayer[]>([]);
    const [naflPrayers, setNaflPrayers] = useState<DisplayPrayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('fard');

    useEffect(() => {
        fetchPrayerTimes();
    }, []);

    const fetchPrayerTimes = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/v1/prayer-times');
            const data = await response.json();
            
            console.log('API Data:', data); // For debugging
            
            if (data.success) {
                // Process Fard Azan
                if (data.data.fard?.azan) {
                    const azan = data.data.fard.azan.map((p: ApiPrayer) => ({
                        id: p.id,
                        name_en: p.display_name_en,
                        name_bn: p.display_name_bn,
                        time: p.time
                    }));
                    setFardAzan(azan);
                }

                // Process Fard Jamaat
                if (data.data.fard?.jamaat) {
                    const jamaat = data.data.fard.jamaat.map((p: ApiPrayer) => ({
                        id: p.id,
                        name_en: p.display_name_en,
                        name_bn: p.display_name_bn,
                        time: p.time
                    }));
                    setFardJamaat(jamaat);
                }

                // Process Nafl Prayers
                if (data.data.nafl) {
                    const nafl = data.data.nafl.map((p: ApiPrayer) => ({
                        id: p.id,
                        name_en: p.display_name_en,
                        name_bn: p.display_name_bn,
                        time: p.time
                    }));
                    setNaflPrayers(nafl);
                }
            } else {
                setError('Failed to load prayer times');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
                <p className="text-emerald-600 mt-4">Loading prayer times...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-6 text-center">
                <div className="text-red-600 mb-4">{error}</div>
                <button 
                    onClick={fetchPrayerTimes}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-emerald-900 mb-2">সময়সূচী - আযান ও জামাত</h1>
                <p className="text-gray-600">Prayer Times - AdDiin (Dhaka)</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('fard')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'fard' 
                        ? 'text-emerald-600 border-b-2 border-emerald-600' 
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                >
                    ফরজ (Fard) {fardAzan.length > 0 && `(${fardAzan.length})`}
                </button>
                <button
                    onClick={() => setActiveTab('nafl')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'nafl' 
                        ? 'text-emerald-600 border-b-2 border-emerald-600' 
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                >
                    নফল (Nafl) {naflPrayers.length > 0 && `(${naflPrayers.length})`}
                </button>
            </div>

            {/* Fard Prayers Tab */}
            {activeTab === 'fard' && (
                <div className="space-y-6">
                    {/* Azan Times Section */}
                    {fardAzan.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-emerald-800 mb-3">আযানের সময়</h2>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                {fardAzan.map((prayer, index) => (
                                    <div 
                                        key={prayer.id}
                                        className={`flex justify-between items-center p-4 ${
                                            index !== fardAzan.length - 1 ? 'border-b' : ''
                                        } hover:bg-emerald-50 transition-colors`}
                                    >
                                        <div>
                                            <span className="font-semibold text-emerald-900">
                                                {prayer.name_en}
                                            </span>
                                            <span className="text-sm text-gray-600 ml-2">
                                                {prayer.name_bn}
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold text-emerald-800">
                                            {prayer.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Jamaat Times Section */}
                    {fardJamaat.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-emerald-800 mb-3">জামাতের সময়</h2>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                {fardJamaat.map((prayer, index) => (
                                    <div 
                                        key={prayer.id}
                                        className={`flex justify-between items-center p-4 ${
                                            index !== fardJamaat.length - 1 ? 'border-b' : ''
                                        } hover:bg-emerald-50 transition-colors`}
                                    >
                                        <div>
                                            <span className="font-semibold text-emerald-900">
                                                {prayer.name_en}
                                            </span>
                                            <span className="text-sm text-gray-600 ml-2">
                                                {prayer.name_bn}
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold text-emerald-800">
                                            {prayer.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Nafl Prayers Tab */}
            {activeTab === 'nafl' && naflPrayers.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-emerald-800 mb-3">নফল ইবাদতের সময়</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {naflPrayers.map((prayer, index) => (
                            <div 
                                key={prayer.id}
                                className={`flex justify-between items-center p-4 ${
                                    index !== naflPrayers.length - 1 ? 'border-b' : ''
                                } hover:bg-emerald-50 transition-colors`}
                            >
                                <div>
                                    <span className="font-semibold text-emerald-900">
                                        {prayer.name_en}
                                    </span>
                                    <span className="text-sm text-gray-600 ml-2">
                                        {prayer.name_bn}
                                    </span>
                                </div>
                                <span className="text-xl font-bold text-emerald-800">
                                    {prayer.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold">নোট:</span> 
                    {' '}সময় পরিবর্তন সাপেক্ষে। রমজান মাসে সময়সূচী পরিবর্তন হতে পারে।
                </p>
            </div>
        </div>
    );
}