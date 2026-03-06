import { useState, useEffect } from 'react';
import { Calendar, Phone, User, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/v1';

interface MiladRequest {
  id: number;
  name: string;
  phone: string;
  description: string;
  milad_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_remark?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

interface PaginatedResponse {
  data: {
    data: MiladRequest[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function MyMiladRequestsPage() {
  const [requests, setRequests] = useState<MiladRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setError('Please log in to view your milad requests');
      setLoading(false);
    } else {
      setIsLoggedIn(true);
      fetchRequests();
    }
  }, [statusFilter, currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('per_page', '10');
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_URL}/user/milads?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setRequests(data.data.data);
        setTotalPages(data.data.last_page);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (error: any) {
      setError('Network error. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Pending
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            Rejected
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-4 border-yellow-500';
      case 'approved':
        return 'border-l-4 border-green-500';
      case 'rejected':
        return 'border-l-4 border-red-500';
      case 'completed':
        return 'border-l-4 border-blue-500';
      default:
        return '';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600">Please log in to view your milad requests</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Milad Requests</h1>
          <p className="text-gray-600">Track the status of your milad event requests</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => {
                setStatusFilter('pending');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1 ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              Pending
            </button>
            <button
              onClick={() => {
                setStatusFilter('approved');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1 ${
                statusFilter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Approved
            </button>
            <button
              onClick={() => {
                setStatusFilter('rejected');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1 ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Rejected
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading your requests...</p>
          </div>
        )}

        {/* Requests List */}
        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? "You haven't submitted any milad requests yet"
                : `No ${statusFilter} requests found`}
            </p>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`bg-white rounded-lg shadow-md p-6 ${getStatusColor(request.status)} hover:shadow-lg transition`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{request.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Request ID: #{request.id}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{request.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(request.milad_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Details:</p>
                  <p className="text-gray-600 text-sm">{request.description}</p>
                </div>

                {request.admin_remark && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Admin Note:</p>
                    <p className="text-blue-800 text-sm">{request.admin_remark}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Submitted on {new Date(request.created_at).toLocaleDateString()} at{' '}
                  {new Date(request.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg font-semibold transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">What do the statuses mean?</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <strong>Pending:</strong> Your request is under review
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <strong>Approved:</strong> Your request has been approved
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <strong>Rejected:</strong> Your request was not approved
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <strong>Completed:</strong> Your milad event has been completed
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
