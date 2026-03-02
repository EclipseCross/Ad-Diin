interface HeroSectionProps {
    onKnowMore?: () => void;
    onAllActivities?: () => void;
  }
  
  export function HeroSection({ onKnowMore, onAllActivities }: HeroSectionProps) {
    return (
      <section className="bg-emerald-50 py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-emerald-900">Welcome to Ad-Diin Mosque</h1>
          <p className="text-lg text-gray-700 mb-8">
            A Place of Prayer, Learning, and Community Service
          </p>
          <div className="flex justify-center gap-6">
            <button
              onClick={onKnowMore}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              Know More
            </button>
            <button
              onClick={onAllActivities}
              className="bg-white text-emerald-600 border border-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition"
            >
              All Activities
            </button>
          </div>
        </div>
      </section>
    );
  }
  