import { useState } from 'react';
import { ThemeProps, categoryNames, getStatusColor } from './shared';

interface DonationsProps extends ThemeProps {
  donations: any[];
  donationStats: any | null;
}

export default function Donations({ darkMode, card, text, sub, bdr, donations, donationStats }: DonationsProps) {
  const [filter, setFilter] = useState('all');

  const filtered = donations.filter(d => {
    if (filter === 'all') return true;
    return d.payment_status === filter || d.category === filter;
  });

  return (
    <div className="space-y-4">
      {donationStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className={`${card} rounded-xl p-4 shadow-sm`}>
            <p className={`text-xs ${sub} mb-1`}>মোট সংগৃহীত</p>
            <p className="text-2xl font-bold text-emerald-600">৳{donationStats.total_completed_amount.toLocaleString('en-BD')}</p>
          </div>
          <div className={`${card} rounded-xl p-4 shadow-sm`}>
            <p className={`text-xs ${sub} mb-1`}>মোট দান সংখ্যা</p>
            <p className={`text-2xl font-bold ${text}`}>{donationStats.total_count}</p>
          </div>
          <div className={`${card} rounded-xl p-4 shadow-sm`}>
            <p className={`text-xs ${sub} mb-1`}>প্রক্রিয়াধীন</p>
            <p className="text-2xl font-bold text-yellow-600">{donationStats.pending_count}</p>
          </div>
        </div>
      )}

      <div className={`${card} rounded-xl shadow-sm p-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <h3 className={`text-xl font-semibold ${text}`}>দানের তালিকা</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all',       label: 'সব' },
              { key: 'completed', label: '✓ সম্পন্ন' },
              { key: 'pending',   label: '⏳ প্রক্রিয়াধীন' },
              { key: 'failed',    label: '✗ ব্যর্থ' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === f.key ? 'bg-emerald-600 text-white' : `border ${bdr} ${sub} hover:bg-gray-100`}`}>
                {f.label}
              </button>
            ))}
            <select
              value={['all','completed','pending','failed'].includes(filter) ? 'cat_all' : filter}
              onChange={e => setFilter(e.target.value === 'cat_all' ? 'all' : e.target.value)}
              className={`px-3 py-1 rounded-lg text-xs border ${bdr} ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none`}>
              <option value="cat_all">সব ক্যাটাগরি</option>
              {Object.entries(categoryNames).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className={`text-center py-8 ${sub}`}>কোনো দান নেই</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['Transaction ID', 'নাম', 'পরিমাণ', 'ক্যাটাগরি', 'পদ্ধতি', 'স্ট্যাটাস', 'তারিখ'].map(h => (
                    <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d: any) => (
                  <tr key={d.id} className={`border-b ${bdr}`}>
                    <td className={`p-3 text-xs ${sub}`}>{d.tran_id}</td>
                    <td className={`p-3 font-medium ${text}`}>{d.name || 'Anonymous'}</td>
                    <td className="p-3 font-medium text-emerald-600">৳{d.amount}</td>
                    <td className={`p-3 ${sub}`}>{categoryNames[d.category] || d.category}</td>
                    <td className={`p-3 ${sub}`}>{d.payment_method || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.payment_status)}`}>{d.payment_status}</span>
                    </td>
                    <td className={`p-3 ${sub}`}>{d.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}