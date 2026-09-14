import { Users, Calendar, MessageSquare, HandHeart, TrendingUp } from 'lucide-react';
import { ThemeProps, categoryNames, categoryColors, getStatusColor } from './shared';

interface DashboardProps extends ThemeProps {
  users: any[];
  events: any[];
  miladRequests: any[];
  donations: any[];
  donationStats: any | null;
  setActiveTab: (tab: string) => void;
  handleMiladStatus: (id: string, status: string) => void;
}

export default function Dashboard({
  darkMode, card, text, sub, bdr,
  users, events, miladRequests, donations, donationStats,
  setActiveTab, handleMiladStatus,
}: DashboardProps) {
  const pendingMilad = miladRequests.filter(m => m.status === 'pending').length;

  const categoryStatsArray = donationStats?.by_category
    ? Object.entries(donationStats.by_category).map(([cat, val]: [string, any]) => ({
        category: cat,
        name: categoryNames[cat] || cat,
        amount: Number(val.total_amount),
        count: Number(val.count),
        color: categoryColors[cat] || 'bg-gray-400',
      })).sort((a, b) => b.amount - a.amount)
    : [];

  const maxAmount = Math.max(...categoryStatsArray.map(c => c.amount), 1);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'মোট ব্যবহারকারী', value: users.length,     icon: Users,         color: 'bg-blue-100 text-blue-600'       },
          { label: 'মোট ইভেন্ট',       value: events.length,    icon: Calendar,      color: 'bg-purple-100 text-purple-600'   },
          { label: 'Pending মিলাদ',     value: pendingMilad,     icon: MessageSquare, color: 'bg-yellow-100 text-yellow-600'   },
          { label: 'মোট দান (সংখ্যা)',  value: donationStats?.total_count ?? donations.length, icon: HandHeart, color: 'bg-emerald-100 text-emerald-600' },
        ].map(s => (
          <div key={s.label} className={`${card} rounded-xl p-5 shadow-sm`}>
            <div className={`inline-flex p-2 rounded-lg mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <p className={`text-2xl font-bold ${text}`}>{s.value}</p>
            <p className={`text-sm ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Donation Stats */}
      {donationStats && (
        <div className={`${card} rounded-xl shadow-sm p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h3 className={`font-semibold ${text}`}>দানের সারসংক্ষেপ</h3>
              <p className={`text-xs ${sub}`}>শুধুমাত্র সম্পন্ন (completed) দানের হিসাব</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">৳{donationStats.total_completed_amount.toLocaleString('en-BD')}</p>
              <p className="text-sm text-emerald-600 mt-1">মোট সংগৃহীত</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{donationStats.total_count - donationStats.pending_count}</p>
              <p className="text-sm text-green-600 mt-1">সম্পন্ন দান</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{donationStats.pending_count}</p>
              <p className="text-sm text-yellow-600 mt-1">প্রক্রিয়াধীন</p>
            </div>
          </div>
          {categoryStatsArray.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${text}`}>ক্যাটাগরি অনুযায়ী দান</h4>
              <div className="space-y-3">
                {categoryStatsArray.map(cat => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${text}`}>{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs ${sub}`}>{cat.count} টি দান</span>
                        <span className="text-sm font-bold text-emerald-600">৳{cat.amount.toLocaleString('en-BD')}</span>
                      </div>
                    </div>
                    <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className={`h-2 rounded-full ${cat.color} transition-all duration-500`} style={{ width: `${(cat.amount / maxAmount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Donations */}
      <div className={`${card} rounded-xl shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${text}`}>সাম্প্রতিক দান</h3>
          <button onClick={() => setActiveTab('donations')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
        </div>
        {donations.length === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো দান নেই</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className={`text-xs ${sub} border-b ${bdr}`}>
                <th className="text-left pb-2">নাম</th>
                <th className="text-left pb-2">পরিমাণ</th>
                <th className="text-left pb-2">ক্যাটাগরি</th>
                <th className="text-left pb-2">স্ট্যাটাস</th>
              </tr></thead>
              <tbody>
                {donations.slice(0, 5).map((d: any) => (
                  <tr key={d.id} className={`border-b ${bdr}`}>
                    <td className={`py-3 font-medium ${text}`}>{d.name || 'Anonymous'}</td>
                    <td className="py-3 font-medium text-emerald-600">৳{d.amount}</td>
                    <td className={`py-3 ${sub}`}>{categoryNames[d.category] || d.category}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.payment_status)}`}>{d.payment_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Milad */}
      <div className={`${card} rounded-xl shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${text}`}>Pending মিলাদ অনুরোধ</h3>
          <button onClick={() => setActiveTab('milad-requests')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
        </div>
        {pendingMilad === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো pending অনুরোধ নেই ✓</p> : (
          <div className="space-y-3">
            {miladRequests.filter(m => m.status === 'pending').slice(0, 3).map((m: any) => (
              <div key={m.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                <div>
                  <p className={`font-medium ${text}`}>{m.name}</p>
                  <p className={`text-xs ${sub}`}>{m.milad_date} — {m.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleMiladStatus(m.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg">অনুমোদন</button>
                  <button onClick={() => handleMiladStatus(m.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg">বাতিল</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className={`${card} rounded-xl shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${text}`}>আসন্ন ইভেন্ট</h3>
          <button onClick={() => setActiveTab('events')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
        </div>
        {events.length === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো ইভেন্ট নেই</p> : (
          <div className="space-y-3">
            {events.slice(0, 3).map((e: any) => (
              <div key={e.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                <div>
                  <p className={`font-medium ${text}`}>{e.event_name}</p>
                  <p className={`text-xs ${sub}`}>{e.event_date} — {e.hijri_date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  e.event_type === 'festival'  ? 'bg-green-100 text-green-800' :
                  e.event_type === 'special'   ? 'bg-purple-100 text-purple-800' :
                  e.event_type === 'religious' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-orange-100 text-orange-800'}`}>{e.event_type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}