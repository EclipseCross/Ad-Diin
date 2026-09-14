import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Heart, Share2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

const categoryLabels: Record<string, string> = {
  education: 'শিক্ষা',
  charity: 'দাতব্য',
  youth: 'যুব কার্যক্রম',
  social: 'সামাজিক',
  religious: 'ধর্মীয়',
  other: 'অন্যান্য',
};

const categoryColors: Record<string, string> = {
  education: 'bg-blue-100 text-blue-700',
  charity: 'bg-emerald-100 text-emerald-700',
  youth: 'bg-purple-100 text-purple-700',
  social: 'bg-orange-100 text-orange-700',
  religious: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/activities`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await response.json();
      const activities = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const found = activities.find((a: any) => a.id === parseInt(id!));
      
      if (found) {
        setActivity(found);
      } else {
        setError('Activity পাওয়া যায়নি');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('ডাটা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'তারিখ উল্লেখ নেই';
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error || 'Activity পাওয়া যায়নি'}</p>
          <button
            onClick={() => navigate('/activities')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            সকল কার্যক্রম দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Large Image */}
      <div className="relative h-72 md:h-96 lg:h-[500px] bg-gradient-to-r from-emerald-700 to-emerald-800">
        {activity.image_url ? (
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
            <Heart className="w-24 h-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/activities')}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition z-10"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        
        {/* Share Button */}
        {navigator.share && (
          <button
            onClick={() => {
              navigator.share({
                title: activity.title,
                text: activity.description,
                url: window.location.href,
              });
            }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition z-10"
          >
            <Share2 className="w-5 h-5 text-gray-800" />
          </button>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {activity.category && (
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${categoryColors[activity.category] || 'bg-gray-100 text-gray-600'}`}>
                {categoryLabels[activity.category] || activity.category}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {activity.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content - Full Description Here */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              প্রকাশিত: {formatDate(activity.created_at)}
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
            {activity.description}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-emerald-800 mb-3">
              এই কার্যক্রমে অংশগ্রহণ করতে চান?
            </h3>
            <p className="text-emerald-700 mb-6">
              আমাদের সাথে যোগাযোগ করুন আরও জানতে
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition font-medium shadow-lg hover:shadow-xl"
              >
                যোগাযোগ করুন
              </button>
              <button
                onClick={() => navigate('/donation')}
                className="bg-white text-emerald-600 px-8 py-3 rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 transition font-medium"
              >
                দান করুন
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4">
          <button
            onClick={() => navigate('/activities')}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            সকল কার্যক্রম
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 transition text-sm"
          >
            পেছনে ফিরুন
          </button>
        </div>
      </div>
    </div>
  );
}