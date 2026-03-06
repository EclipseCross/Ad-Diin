import { useState } from 'react';
import { Heart, Users, TrendingUp, DollarSign } from 'lucide-react';

export default function ZakatCalculatorPage() {
  const [totalAmount, setTotalAmount] = useState('');
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const calculateZakat = () => {
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount < 0) {
      setZakatAmount(null);
      setShowResult(false);
      return;
    }
    const zakat = (amount * 2.5) / 100;
    setZakatAmount(zakat);
    setShowResult(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      calculateZakat();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalAmount(e.target.value);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Zakat Calculator
          </h1>
          <p className="text-lg text-slate-600">
            Calculate your Zakat obligation and purify your wealth
          </p>
        </div>

        {/* Zakat Information Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border-2 border-emerald-100">
          
          {/* What is Zakat */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500 text-white p-3 rounded-full">
                <Heart size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">What is Zakat?</h2>
            </div>
            <p className="text-slate-700 leading-relaxed ml-12">
              Zakat is one of the Five Pillars of Islam, a fundamental obligation for every Muslim. It represents a 
              spiritual and financial responsibility to contribute 2.5% of your eligible wealth to those in need. 
              Zakat is not charity (Sadaqah), but a mandatory religious duty that purifies wealth and strengthens 
              the Islamic community (Ummah).
            </p>
          </div>

          {/* Why Zakat is Given */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500 text-white p-3 rounded-full">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Why Zakat is Given</h2>
            </div>
            <div className="ml-12 space-y-3">
              <p className="text-slate-700"><span className="font-semibold">Purifies Wealth:</span> Zakat cleanses your wealth of stinginess and greedy desires.</p>
              <p className="text-slate-700"><span className="font-semibold">Helps the Poor:</span> It directly reduces poverty and supports those in hardship.</p>
              <p className="text-slate-700"><span className="font-semibold">Creates Social Balance:</span> Zakat helps create equity in society and strengthens community bonds.</p>
            </div>
          </div>

          {/* Virtues (Fazilat) of Zakat */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500 text-white p-3 rounded-full">
                <Heart size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Virtues of Zakat</h2>
            </div>
            <div className="ml-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                <p className="font-semibold text-slate-900 mb-1">🌟 Brings Blessings</p>
                <p className="text-slate-600 text-sm">Increases barakah (blessing) in your wealth and life.</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                <p className="font-semibold text-slate-900 mb-1">❤️ Removes Greed</p>
                <p className="text-slate-600 text-sm">Purifies the heart from attachment to material possessions.</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                <p className="font-semibold text-slate-900 mb-1">🤝 Strengthens Community</p>
                <p className="text-slate-600 text-sm">Builds a just and compassionate society for all.</p>
              </div>
            </div>
          </div>

          {/* Who Can Receive Zakat */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500 text-white p-3 rounded-full">
                <Users size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Who Can Receive Zakat</h2>
            </div>
            <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-slate-900 mb-2">Poor (Fuqara)</p>
                <p className="text-slate-700">Those who own less than the Nisab (minimum threshold) of wealth.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-slate-900 mb-2">Needy (Masakin)</p>
                <p className="text-slate-700">Those struggling to meet their basic needs for survival.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-slate-900 mb-2">People in Debt</p>
                <p className="text-slate-700">Those burdened by debt and unable to repay their obligations.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-slate-900 mb-2">Travelers in Need</p>
                <p className="text-slate-700">Those on a journey facing unexpected financial hardship.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zakat Calculator Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-2 border-emerald-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500 text-white p-3 rounded-full">
              <DollarSign size={28} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Calculate Your Zakat</h2>
          </div>

          <div className="bg-emerald-50 p-6 rounded-xl mb-8 border border-emerald-200">
            <p className="text-slate-700 mb-4">
              <span className="font-semibold">Formula:</span> Zakat = Total Amount × 2.5%
            </p>
            <p className="text-slate-600 text-sm">
              Enter your total eligible wealth below to calculate your Zakat obligation.
            </p>
          </div>

          {/* Input Field */}
          <div className="mb-8">
            <label className="block text-slate-900 font-semibold mb-3">
              Total Amount of Money
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-3 text-slate-500 font-semibold">৳</span>
                <input
                  type="number"
                  placeholder="Enter amount (e.g., 100000)"
                  value={totalAmount}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-lg"
                />
              </div>
              <button
                onClick={calculateZakat}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Calculate Zakat
              </button>
            </div>
          </div>

          {/* Result Section */}
          {showResult && zakatAmount !== null && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg transform animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-lg mb-2">Your Zakat Amount</p>
                  <p className="text-5xl font-bold">
                    ৳ {zakatAmount.toLocaleString('en-BD', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Heart size={48} className="text-emerald-100 opacity-50" />
              </div>
              <div className="mt-6 pt-6 border-t border-emerald-400 text-emerald-100 text-sm">
                <p>
                  Based on total wealth of ৳ {parseFloat(totalAmount).toLocaleString('en-BD')} at 2.5% Zakat rate.
                </p>
              </div>
            </div>
          )}

          {showResult && zakatAmount === null && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-red-700">
              <p className="font-semibold">Please enter a valid amount to calculate.</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 bg-slate-50 p-6 rounded-lg border-l-4 border-slate-300">
            <h3 className="font-bold text-slate-900 mb-3">Important Notes:</h3>
            <ul className="text-slate-700 space-y-2 text-sm">
              <li>✓ Zakat is due when you have owned wealth equal to or above the <span className="font-semibold">Nisab</span> (minimum threshold) for one lunar year.</li>
              <li>✓ The current Nisab for gold is approximately 87.48g, and for silver is 612.36g.</li>
              <li>✓ Zakat should ideally be paid during Ramadan for increased reward.</li>
              <li>✓ Seek guidance from a qualified Islamic law scholar (Aalim) for complex financial situations.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
  