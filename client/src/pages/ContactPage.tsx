import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
      <p className="text-gray-700 max-w-3xl mx-auto mb-8 text-center">
        Email: info@ad-diin.org | Phone: +880 1234 567890 | Address: 123 Mosque Street, Dhaka, Bangladesh
      </p>
      <div className="max-w-md mx-auto">
        <form className="space-y-4">
          <input className="w-full p-3 border rounded-lg" type="text" placeholder="Your Name" />
          <input className="w-full p-3 border rounded-lg" type="email" placeholder="Your Email" />
          <textarea className="w-full p-3 border rounded-lg" placeholder="Message" rows={5}></textarea>
          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition">
            Send Message
          </button>
        </form>
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
