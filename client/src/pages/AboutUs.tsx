import { BookOpen, Users, Heart, Sparkles, Award, Clock } from 'lucide-react';

export default function AboutUs() {
  const values = [
    {
      icon: BookOpen,
      title: 'Knowledge',
      description: 'We promote Islamic education and understanding through Quran classes and lectures.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a strong Muslim community through regular gatherings and support.',
    },
    {
      icon: Heart,
      title: 'Compassion',
      description: 'Serving those in need through charity, donations, and welfare programs.',
    },
    {
      icon: Sparkles,
      title: 'Faith',
      description: 'Encouraging spiritual growth and devotion through daily prayers and worship.',
    },
  ];

  const stats = [
    { value: '5+', label: 'Daily Prayers' },
    { value: '500+', label: 'Community Members' },
    { value: '20+', label: 'Monthly Programs' },
    { value: '10+', label: 'Years Serving' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute -right-20 top-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-200">Welcome to</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
            Ad-Diin Mosque
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-emerald-50 md:text-xl">
            A spiritual home dedicated to worship, education, and community service. 
            We strive to strengthen Islamic values and foster unity among Muslims in Dhaka.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-lg"
              >
                <p className="text-3xl font-black text-emerald-600 md:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-8 shadow-md">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Award className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Our Mission</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                To establish a vibrant Islamic center that serves as a beacon of faith, knowledge, 
                and compassion. We aim to provide a welcoming space for worship, learning, and 
                community engagement while supporting those in need.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-8 shadow-md">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Our Vision</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                To be recognized as a leading Islamic institution that nurtures spiritual growth, 
                promotes Islamic values, and creates positive change in our community through 
                education, charity, and unity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Our Foundation</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">Core Values</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              The principles that guide everything we do at Ad-Diin Mosque
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600 transition group-hover:bg-emerald-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs Overview */}
      <section className="bg-gradient-to-br from-emerald-100/60 to-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">What We Offer</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">Our Programs</h2>
          </div>

          <div className="mt-12 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-800">Daily Prayers & Jamaat</h3>
              <p className="mt-2 text-slate-600">
                Five daily prayers with congregation, Friday Jummah prayers, and special Taraweeh prayers during Ramadan.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-800">Islamic Education</h3>
              <p className="mt-2 text-slate-600">
                Quran recitation classes, Hadith study circles, Arabic language courses, and youth Islamic education programs.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-800">Community Events</h3>
              <p className="mt-2 text-slate-600">
                Eid celebrations, Milad-un-Nabi gatherings, Iftar programs during Ramadan, and regular community dinners.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-800">Social Welfare</h3>
              <p className="mt-2 text-slate-600">
                Zakat distribution, food donations for the needy, support for orphans, and assistance for struggling families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Join Our Community</h2>
          <p className="mt-4 text-lg text-slate-600">
            Whether you're new to the area or looking for a spiritual home, we welcome you with open arms.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              Contact Us
            </a>
            <a
              href="/prayer-times"
              className="rounded-xl border-2 border-emerald-600 bg-white px-8 py-3 font-bold text-emerald-600 transition hover:bg-emerald-50"
            >
              Prayer Times
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
