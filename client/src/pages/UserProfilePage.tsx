import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Edit2, Save, X, MapPin, 
  Home, Globe, Camera, Lock, Key, Eye, EyeOff, Shield 
} from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture?: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    date_of_birth: '',
    gender: '',
    profile_picture: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('Profile mounted - Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      navigate('/user-login');
      return;
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          address: parsedUser.address || '',
          city: parsedUser.city || '',
          postal_code: parsedUser.postal_code || '',
          date_of_birth: parsedUser.date_of_birth || '',
          gender: parsedUser.gender || '',
          profile_picture: parsedUser.profile_picture || ''
        });
      } catch (e) {
        console.error('Error parsing saved user');
      }
    }

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          city: data.user.city || '',
          postal_code: data.user.postal_code || '',
          date_of_birth: data.user.date_of_birth || '',
          gender: data.user.gender || '',
          profile_picture: data.user.profile_picture || ''
        });
        
        localStorage.setItem('user', JSON.stringify(data.user));
        
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/user-login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You are not logged in');
      navigate('/user-login');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('http://localhost:8000/api/v1/user/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPasswordError('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      setLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      const res = await fetch('http://localhost:8000/api/v1/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          new_password_confirmation: passwordData.new_password_confirmation
        })
      });

      const data = await res.json();

      if (data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        setTimeout(() => {
          setChangingPassword(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      await fetch('http://localhost:8000/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user data found</p>
          <button
            onClick={() => navigate('/user-login')}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Photo */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 h-32 relative">
            {user.role === 'admin' && (
              <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                Admin
              </span>
            )}
          </div>
          
          <div className="px-8 pb-8">
            {/* Avatar and Buttons Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 -mt-6">
              {/* Avatar */}
              <div className="relative">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <div className="bg-emerald-100 p-4 rounded-full relative">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-emerald-600" />
                    )}
                  </div>
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Action Buttons - এগুলো সবসময় দেখা যাবে */}
              {!editing && !changingPassword ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 flex items-center gap-2 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Change Password
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="h-12"></div> // Placeholder when editing
              )}
            </div>

            {/* Profile Info or Edit Form */}
            {!editing && !changingPassword ? (
              // View Profile
              <div className="mt-8 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-emerald-600 font-medium capitalize">{user.role}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.is_active ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Contact Information</h3>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium truncate">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{formatDate(user.date_of_birth)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{user.gender || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Info */}
                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Address Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Home className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium truncate">{user.address || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">City</p>
                          <p className="font-medium truncate">{user.city || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Globe className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Postal Code</p>
                          <p className="font-medium truncate">{user.postal_code || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-sm text-gray-500 border-t">
                  Member since: {formatDate(user.created_at)}
                </div>
              </div>
            ) : editing ? (
              // Edit Profile Form
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </h3>
                
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Address Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleUpdate}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          address: user.address || '',
                          city: user.city || '',
                          postal_code: user.postal_code || '',
                          date_of_birth: user.date_of_birth || '',
                          gender: user.gender || '',
                          profile_picture: user.profile_picture || ''
                        });
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Change Password Form
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </h3>

                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                        placeholder="Enter new password (min. 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 6 characters long</li>
                      <li>Should be different from current password</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleChangePassword}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setChangingPassword(false);
                        setPasswordData({
                          current_password: '',
                          new_password: '',
                          new_password_confirmation: ''
                        });
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}