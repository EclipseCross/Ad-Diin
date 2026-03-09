import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Phone, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/v1';

interface MiladFormData {
  name: string;
  phone: string;
  description: string;
  milad_date: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

export default function MiladBookingPage() {
  const [formData, setFormData] = useState<MiladFormData>({
    name: '',
    phone: '',
    description: '',
    milad_date: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const navigate = useNavigate();

  // Check if user is logged in and get token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (storedToken && user) {
      setToken(storedToken);
      setIsLoggedIn(true);
      console.log('Token found:', storedToken.substring(0, 20) + '...'); // Debug log
    } else {
      setIsLoggedIn(false);
      setToken(null);
      console.log('No token found');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');

    // Check if user is logged in
    if (!isLoggedIn || !token) {
      setErrorMessage('Please log in to submit a milad request');
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting with token:', token.substring(0, 20) + '...'); // Debug log
      console.log('Form data:', formData); // Debug log

      const response = await fetch(`${API_URL}/milads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response status:', response.status); // Debug log
      console.log('Response data:', data); // Debug log

      if (response.ok && data.success) {
        setSuccessMessage('Milad request submitted successfully! Status: Pending review');
        setFormData({
          name: '',
          phone: '',
          description: '',
          milad_date: '',
        });
        
        // Clear success message after 5 seconds and redirect
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/my-milad-requests');
        }, 2000);
      } else {
        // Handle different error types
        if (response.status === 401) {
          // Token expired or invalid
          setErrorMessage('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/user-login');
          }, 2000);
        } else if (response.status === 422 && data.errors) {
          // Validation errors
          setErrors(data.errors);
          setErrorMessage(data.message || 'Please check the form for errors');
        } else {
          // Other errors
          setErrorMessage(data.message || 'Failed to submit milad request');
        }
      }
    } catch (error: any) {
      console.error('Network error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to submit a milad request</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/user-login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header with View Requests Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Milad Request</h1>
            <p className="text-gray-600">Book a Milad celebration at our mosque</p>
          </div>
          <button
            onClick={() => navigate('/my-milad-requests')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View My Requests
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900">Success!</h3>
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Milad Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Celebration of birth of Prophet Muhammad (Peace be upon him)"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., 017XXXXXXXX"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone[0]}</p>
              )}
            </div>

            {/* Milad Date Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Milad Date
              </label>
              <input
                type="date"
                name="milad_date"
                value={formData.milad_date}
                onChange={handleInputChange}
                min={today}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.milad_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.milad_date && (
                <p className="text-red-600 text-sm mt-1">{errors.milad_date[0]}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Select a date from today onwards</p>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description/Details
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about the milad celebration (guests expected, special requirements, etc.)"
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Minimum 10 characters required</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                'Submit Milad Request'
              )}
            </button>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✓ Your request will be reviewed by our team</li>
                <li>✓ You will receive an email confirmation</li>
                <li>✓ Our staff will contact you within 2-3 days</li>
                <li>✓ Status will change from "Pending" to "Approved"</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">Need help? Contact us at info@addiin.com or call +880-XXX-XXXXXX</p>
        </div>
      </div>
    </div>
  );
}