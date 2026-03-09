interface OngoingActivitiesProps {
    onViewAll?: () => void;
  }
  
  export function OngoingActivities({ onViewAll }: OngoingActivitiesProps) {
    const activities = [
      { title: 'Quran Class', desc: 'Children and adults Quran study program' },
      { title: 'Youth Meeting', desc: 'Weekly youth gathering and learning' },
      { title: 'Community Service', desc: 'Charity and social help initiatives' },
    ];
  
    return (
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-emerald-900">Ongoing Activities</h2>
            <button
              onClick={onViewAll}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map((a) => (
              <div key={a.title} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">{a.title}</h3>
                <p className="text-gray-700">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  