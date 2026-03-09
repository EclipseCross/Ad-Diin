interface Props {
    onLogout?: () => void;
  }
  export default function AdminDashboard({ onLogout }: Props) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <button onClick={onLogout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
    );
  }
  