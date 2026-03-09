import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ActivitiesPage from './pages/ActivitiesPage';
import DonatePage from './pages/DonatePage';
import ContactPage from './pages/ContactPage';
import EventsPage from './pages/EventsPage';
import ZakatCalculatorPage from './pages/ZakatCalculatorPage';
import PrayerTimesPage from './pages/PrayerTimesPage';
import MiladBookingPage from './pages/MiladBookingPage';
import MyMiladRequestsPage from './pages/MyMiladRequestsPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import DiinAIPage from './pages/DiinAIPage';
import EmailVerificationPage from './pages/EmailVerificationPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/zakat" element={<ZakatCalculatorPage />} />
            <Route path="/prayer-times" element={<PrayerTimesPage />} />
            <Route path="/milad" element={<MiladBookingPage />} />
            <Route path="/my-milad-requests" element={<MyMiladRequestsPage />} />
            <Route path="/diin-ai" element={<DiinAIPage />} />
            
            {/* Auth Routes */}
            <Route path="/user-login" element={<UserLoginPage />} />
            <Route path="/user-registration" element={<UserRegistrationPage />} />
            <Route path="/user-profile" element={<UserProfilePage />} />  {/* 👈 নতুন route */}
            
            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}