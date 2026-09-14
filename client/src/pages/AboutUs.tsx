import { useEffect, useState } from 'react';
import { BookOpen, Users, Heart, Sparkles, Award, Clock, Phone, User } from 'lucide-react';
import { fetchAboutContent, loadAboutContent, type AboutContent } from '../admin/aboutContent';

export default function AboutUs() {
  const [content, setContent] = useState<AboutContent>(loadAboutContent());

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const latest = await fetchAboutContent();
      if (active) {
        setContent(latest);
      }
    };

    refresh();

    const handler = () => {
      void refresh();
    };

    const customHandler = () => {
      void refresh();
    };

    window.addEventListener('storage', handler);
    window.addEventListener('ad-diin-about-updated', customHandler as EventListener);

    return () => {
      active = false;
      window.removeEventListener('storage', handler);
      window.removeEventListener('ad-diin-about-updated', customHandler as EventListener);
    };
  }, []);

  const values = [BookOpen, Users, Heart, Sparkles].map((icon, index) => ({
    icon,
    title: content.values[index]?.title || '',
    description: content.values[index]?.description || '',
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute -right-20 top-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-200">{content.heroBadge}</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
            {content.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-emerald-50 md:text-xl">
            {content.heroDescription}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {content.stats.map((stat, idx) => (
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
              <h2 className="text-2xl font-black text-slate-900">{content.missionTitle}</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                {content.missionDescription}
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-8 shadow-md">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{content.visionTitle}</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                {content.visionDescription}
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
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{content.valuesTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              {content.valuesDescription}
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
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{content.programsTitle}</h2>
            {content.programsDescription && (
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">{content.programsDescription}</p>
            )}
          </div>

          <div className="mt-12 space-y-4">
            {content.programs.map(program => (
              <div key={program.title} className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">{program.title}</h3>
                <p className="mt-2 text-slate-600">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Heads */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Leadership</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{content.communityHeadsTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">{content.communityHeadsDescription}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {content.communityHeads.map((head, index) => (
              <div key={`${head.name}-${index}`} className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{head.name}</h3>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{head.role}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  {head.phone}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">{content.ctaTitle}</h2>
          <p className="mt-4 text-lg text-slate-600">
            {content.ctaDescription}
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
