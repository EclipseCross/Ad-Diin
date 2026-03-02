import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface DonatePageProps {
  scrollToFund?: string;
}

export default function DonatePage({ scrollToFund }: DonatePageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollToFund) {
      const el = document.getElementById(scrollToFund);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [scrollToFund]);

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Donate</h1>

      <div className="max-w-md mx-auto space-y-4">
        <button
          id="iftar"
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Donate for Iftar
        </button>

        <button
          id="zakat"
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Donate for Zakat
        </button>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
