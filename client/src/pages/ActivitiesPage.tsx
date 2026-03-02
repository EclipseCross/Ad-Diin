import { useNavigate } from 'react-router-dom';

export default function ActivitiesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Ongoing Activities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="p-6 bg-emerald-50 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Quranic Study</h2>
          <p>Daily Quran classes for children and adults.</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Youth Program</h2>
          <p>Activities and education for youth engagement.</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Charity & Zakat</h2>
          <p>Ongoing social welfare and charity initiatives.</p>
        </div>
      </div>
      <div className="text-center mt-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
