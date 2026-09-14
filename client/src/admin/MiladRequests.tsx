import { CheckCircle, XCircle } from 'lucide-react';
import { ThemeProps, getStatusColor } from './shared';

interface MiladRequestsProps extends ThemeProps {
  miladRequests: any[];
  handleMiladStatus: (id: string, status: string) => void;
}

export default function MiladRequests({ card, text, sub, bdr, miladRequests, handleMiladStatus }: MiladRequestsProps) {
  return (
    <div className={`${card} rounded-xl shadow-sm p-6`}>
      <h3 className={`text-xl font-semibold mb-6 ${text}`}>মিলাদ অনুরোধ</h3>
      {miladRequests.length === 0 ? (
        <p className={`text-center py-8 ${sub}`}>কোনো অনুরোধ নেই</p>
      ) : (
        <div className="space-y-4">
          {miladRequests.map((m: any) => (
            <div key={m.id} className={`border ${bdr} rounded-lg p-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${text}`}>{m.name}</h4>
                  <p className={`text-sm ${sub}`}>{m.phone} — {m.milad_date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>{m.status}</span>
              </div>
              {m.description && <p className={`text-sm mt-2 ${sub}`}>{m.description}</p>}
              {m.admin_remark && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-xs text-blue-600">Admin Note: {m.admin_remark}</p>
                </div>
              )}
              {m.status === 'pending' && (
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => handleMiladStatus(m.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> অনুমোদন
                  </button>
                  <button onClick={() => handleMiladStatus(m.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> বাতিল
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
