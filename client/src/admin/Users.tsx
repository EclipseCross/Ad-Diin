import { UserCheck, UserX, Trash2 } from 'lucide-react';
import { ThemeProps } from './shared';

interface UsersProps extends ThemeProps {
  users: any[];
  deleteConfirm: string | null;
  setDeleteConfirm: (id: string | null) => void;
  handleToggleUser: (userId: string, isActive: boolean) => void;
  handleDeleteUser: (userId: string) => void;
}

export default function Users({
  darkMode, card, text, sub, bdr,
  users, deleteConfirm, setDeleteConfirm,
  handleToggleUser, handleDeleteUser,
}: UsersProps) {
  return (
    <>
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>ব্যবহারকারী মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      <div className={`${card} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-xl font-semibold mb-6 ${text}`}>ব্যবহারকারী ব্যবস্থাপনা</h3>
        {users.length === 0 ? (
          <p className={`text-center py-8 ${sub}`}>কোনো ব্যবহারকারী নেই</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['নাম', 'ইমেইল', 'ফোন', 'রোল', 'স্ট্যাটাস', 'Action'].map(h => (
                    <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className={`border-b ${bdr}`}>
                    <td className={`p-3 font-medium ${text}`}>{u.name}</td>
                    <td className={`p-3 ${sub}`}>{u.email}</td>
                    <td className={`p-3 ${sub}`}>{u.phone || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleUser(u.id, !!u.is_active)} className="p-1 rounded hover:bg-gray-100">
                          {u.is_active
                            ? <UserX className="w-4 h-4 text-orange-500" />
                            : <UserCheck className="w-4 h-4 text-green-500" />}
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => setDeleteConfirm(u.id)} className="p-1 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}