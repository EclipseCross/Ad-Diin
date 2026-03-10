import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, ArrowRight, Loader2 } from 'lucide-react';

export default function DonateSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tranId = searchParams.get('tran_id');
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8000';

  useEffect(() => {
    if (tranId) {
      fetch(`${API_URL}/api/v1/donation/${tranId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setDonation(data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tranId]);

  const categoryNames: Record<string, string> = {
    zakat: 'যাকাত', iftar: 'ইফতার', durjog: 'দুর্গত',
    sitarto: 'শীতার্ত', gachropon: 'গাছরোপণ',
    kurbani: 'কুরবানি', orphan: 'এতিম', general: 'সাধারণ অনুদান'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-emerald-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">আলহামদুলিল্লাহ!</h1>
        <p className="text-emerald-600 font-semibold text-lg mb-6">
          আপনার দান সফলভাবে গৃহীত হয়েছে
        </p>

        {/* Donation Details */}
        {donation && (
          <div className="bg-emerald-50 rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">ট্রানজেকশন ID</span>
              <span className="font-semibold text-gray-800 text-sm">{donation.tran_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ক্যাটাগরি</span>
              <span className="font-semibold text-gray-800">
                {categoryNames[donation.category] ?? donation.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">পরিমাণ</span>
              <span className="font-bold text-emerald-600 text-lg">৳{donation.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">পেমেন্ট পদ্ধতি</span>
              <span className="font-semibold text-gray-800">{donation.payment_method ?? 'SSLCommerz'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">স্ট্যাটাস</span>
              <span className="font-semibold text-emerald-600">সম্পন্ন ✓</span>
            </div>
          </div>
        )}

        <p className="text-gray-500 text-sm mb-8">
          আল্লাহ আপনার দান কবুল করুন এবং আপনাকে উত্তম প্রতিদান দিন। আমিন।
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/donate')}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            আবার দান করুন
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            হোমে যান
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}