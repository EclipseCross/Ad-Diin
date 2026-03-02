interface DonationFundsProps {
    onViewAll?: () => void;
  }
  
  export function DonationFunds({ onViewAll }: DonationFundsProps) {
    const funds = [
      { title: 'Iftar Fund', desc: 'Provide Iftar meals during Ramadan' },
      { title: 'Zakat Fund', desc: 'Support the needy with Zakat donations' },
      { title: 'Masjid Maintenance', desc: 'Help maintain mosque facilities' },
    ];
  
    return (
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-emerald-900">Donation Funds</h2>
            <button
              onClick={onViewAll}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {funds.map((f) => (
              <div key={f.title} className="bg-emerald-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-700">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  