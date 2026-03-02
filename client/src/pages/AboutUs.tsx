import { useNavigate } from 'react-router-dom';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">About Us</h1>
      <p className="text-gray-700 max-w-3xl mx-auto mb-8">
        Ad-Diin Mosque is a place for prayer, learning, and community service. We offer daily prayers, educational programs, youth activities, and social welfare initiatives.
      </p>
      <div className="text-center">
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
