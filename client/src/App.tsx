import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetails from './pages/ActivityDetails';
import DonatePage from './pages/DonatePage';
import DonateSuccess from './pages/DonateSuccess';
import ContactPage from './pages/ContactPage';
import MessagingPage from './pages/MessagingPage';
import EventsPage from './pages/EventsPage';
import ZakatCalculatorPage from './pages/ZakatCalculatorPage';
import PrayerTimesPage from './pages/PrayerTimesPage';
import MiladBookingPage from './pages/MiladBookingPage';
import MyMiladRequestsPage from './pages/MyMiladRequestsPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import UserProfilePage from './pages/UserProfilePage';
import DiinAIPage from './pages/DiinAIPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import MyDonationsPage from './pages/MyDonationsPage';
import AdminPanel from './admin/AdminPanel';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Admin route paths — Header ও Footer এখানে দেখাবে না
const ADMIN_PATHS = ['/admin/panel', '/admin/dashboard', '/admin-dashboard'];

function Layout() {
  const location = useLocation();
  const isAdminRoute = ADMIN_PATHS.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivityDetails />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/messaging" element={<MessagingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/zakat" element={<ZakatCalculatorPage />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/milad" element={<MiladBookingPage />} />
          <Route path="/my-milad-requests" element={<MyMiladRequestsPage />} />
          <Route path="/diin-ai" element={<DiinAIPage />} />

          {/* User Routes */}
          <Route path="/my-donations" element={<MyDonationsPage />} />
          <Route path="/user-login" element={<UserLoginPage />} />
          <Route path="/user-registration" element={<UserRegistrationPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />

          {/* Admin login → /user-login এ redirect (AdminLogin delete করা হয়েছে) */}
          <Route path="/admin/login" element={<Navigate to="/user-login" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/panel" replace />} />

          {/* Admin Routes — Header/Footer নেই */}
          <Route
            path="/admin/panel"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
      

          {/* Donate Callback Routes */}
          <Route path="/donate/success" element={<DonateSuccess />} />
          <Route path="/donate/fail" element={<DonateSuccess />} />
          <Route path="/donate/cancel" element={<DonateSuccess />} />
          <Route path="/donate/pending" element={<DonateSuccess />} />

          {/* Other */}
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Go Home
                </button>
              </div>
            </div>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}