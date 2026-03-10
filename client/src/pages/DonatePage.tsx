import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Coffee, Users, TreePine, 
  Beef, Home, Droplets, Gift, 
  ArrowRight, Loader2
} from 'lucide-react';

interface DonationCategory {
  id: string;
  title: string;
  titleBn: string;
  descriptionBn: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  minAmount?: number;
}

export default function DonatePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8000';

  const categories: DonationCategory[] = [
    { id: 'zakat',     title: 'Zakat',            titleBn: 'যাকাত',          descriptionBn: 'আপনার যাকাত দিয়ে দরিদ্রদের সহায়তা করুন',        icon: <Heart className="w-8 h-8" />,    color: 'text-emerald-600', bgColor: 'bg-emerald-50', minAmount: 100 },
    { id: 'iftar',     title: 'Iftar',             titleBn: 'ইফতার',          descriptionBn: 'রমজানে রোজাদারদের ইফতার করান',                   icon: <Coffee className="w-8 h-8" />,   color: 'text-orange-600',  bgColor: 'bg-orange-50',  minAmount: 50  },
    { id: 'durjog',    title: 'Disaster Relief',   titleBn: 'দুর্গত',         descriptionBn: 'প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের সহায়তা',      icon: <Home className="w-8 h-8" />,     color: 'text-red-600',     bgColor: 'bg-red-50',     minAmount: 100 },
    { id: 'sitarto',   title: 'Winter Clothes',    titleBn: 'শীতার্ত',        descriptionBn: 'শীতার্তদের শীতবস্ত্র দিন',                        icon: <Droplets className="w-8 h-8" />, color: 'text-blue-600',    bgColor: 'bg-blue-50',    minAmount: 50  },
    { id: 'gachropon', title: 'Tree Plantation',   titleBn: 'গাছরোপণ',        descriptionBn: 'সবুজ ভবিষ্যতের জন্য গাছ লাগান',                  icon: <TreePine className="w-8 h-8" />, color: 'text-green-600',   bgColor: 'bg-green-50',   minAmount: 20  },
    { id: 'kurbani',   title: 'Qurbani',           titleBn: 'কুরবানি',        descriptionBn: 'আপনার কুরবানি আমাদের সাথে সম্পন্ন করুন',         icon: <Beef className="w-8 h-8" />,     color: 'text-amber-600',   bgColor: 'bg-amber-50',   minAmount: 500 },
    { id: 'orphan',    title: 'Orphan Care',       titleBn: 'এতিম',           descriptionBn: 'এতিম শিশুদের সহায়তা করুন',                       icon: <Users className="w-8 h-8" />,    color: 'text-purple-600',  bgColor: 'bg-purple-50',  minAmount: 100 },
    { id: 'general',   title: 'General Donation',  titleBn: 'সাধারণ অনুদান',  descriptionBn: 'আমাদের সাধারণ কল্যাণমূলক কাজে সহায়তা করুন',    icon: <Gift className="w-8 h-8" />,     color: 'text-gray-600',    bgColor: 'bg-gray-50',    minAmount: 50  },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowPayment(true);
    setError('');
    const category = categories.find(c => c.id === categoryId);
    if (category?.minAmount) setAmount(category.minAmount);
  };

  const handleDonate = async () => {
    if (amount < (selectedCat?.minAmount || 0)) return;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // ✅ user object থেকে phone নেওয়া হচ্ছে
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userName  = user.name  || 'Anonymous';
      const userEmail = user.email || '';
      const userPhone = user.phone || '01700000000'; // phone না থাকলে default

      const response = await fetch(`${API_URL}/api/v1/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          category:     selectedCategory,
          amount:       amount,
          name:         userName,
          email:        userEmail,
          phone:        userPhone,
          is_anonymous: false
        })
      });

      const data = await response.json();

      if (data.success && data.gateway_url) {
        window.location.href = data.gateway_url;
      } else {
        setError(data.message || 'Payment initiation failed');
      }
    } catch (err) {
      console.error('Donation error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [100, 200, 500, 1000, 5000];
  const selectedCat  = categories.find(c => c.id === selectedCategory);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/user-login', { state: { from: '/donate' } });
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">দান করুন</h1>
          <p className="text-xl text-gray-600">আপনার দান হোক লক্ষ্যবস্তু, পরিবর্তনের হাতিয়ার</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Categories Grid */}
        {!showPayment && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`${category.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1`}
                onClick={() => { if (checkAuth()) handleCategorySelect(category.id); }}
              >
                <div className={`${category.color} mb-4`}>{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{category.titleBn}</h3>
                <p className="text-sm text-gray-600 mb-2">{category.title}</p>
                <p className="text-gray-700 mb-4">{category.descriptionBn}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">ন্যূনতম: ৳{category.minAmount}</span>
                  <ArrowRight className={`w-5 h-5 ${category.color}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Form */}
        {showPayment && selectedCat && (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCat.titleBn}</h2>
            <p className="text-gray-600 mb-6">{selectedCat.descriptionBn}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">পরিমাণ নির্বাচন করুন</label>
              <div className="grid grid-cols-3 gap-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => { setAmount(preset); setCustomAmount(''); }}
                    className={`py-3 rounded-lg font-semibold transition ${
                      amount === preset && !customAmount
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ৳{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">অথবা নিজের পরিমাণ দিন</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(Number(e.target.value) || 0); }}
                  placeholder="পরিমাণ লিখুন"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min={selectedCat.minAmount}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">ন্যূনতম: ৳{selectedCat.minAmount}</p>
            </div>

            <button
              onClick={handleDonate}
              disabled={loading || amount < (selectedCat.minAmount || 0)}
              className={`w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 ${
                loading || amount < (selectedCat.minAmount || 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> প্রক্রিয়াকরণ...</>
              ) : (
                `দান করুন ৳${amount}`
              )}
            </button>

            <button
              onClick={() => { setShowPayment(false); setSelectedCategory(null); setError(''); }}
              className="w-full mt-4 text-gray-500 hover:text-gray-700"
            >
              বাতিল করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}