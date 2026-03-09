import { FormEvent, useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, SendHorizontal } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-100/50 px-4 py-10 md:px-8 md:py-14">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl rounded-3xl border border-emerald-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,185,129,0.12)] backdrop-blur md:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Contact Us</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Get In Touch
                <br />
                With Ad-Diin
              </h1>
              <p className="mt-4 max-w-lg text-base text-slate-600">
                Questions about prayer schedules, activities, donations, or Milad booking? Our team is here to help.
                Send your message and we will respond as soon as possible.
              </p>
            </div>

            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <span className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Email</p>
                  <p className="font-bold text-slate-800">info@ad-diin.org</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <span className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Phone</p>
                  <p className="font-bold text-slate-800">+880 1234 567890</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <span className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Address</p>
                  <p className="font-bold text-slate-800">Mosque Street, Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="mb-3 text-sm font-semibold text-slate-600">Reach us on</p>
                <div className="flex gap-2">
                  <button type="button" className="rounded-xl border border-emerald-200 bg-white p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:text-emerald-700">
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded-xl border border-emerald-200 bg-white p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:text-emerald-700">
                    <Instagram className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded-xl border border-emerald-200 bg-white p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:text-emerald-700">
                    <Linkedin className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/60 p-5 shadow-sm md:p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label htmlFor="company" className="mb-1.5 block text-sm font-semibold text-slate-700">Company (Optional)</label>
                <input
                  id="company"
                  type="text"
                  placeholder="Organization name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-slate-700">Your Message</label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
              >
                <SendHorizontal className="h-4 w-4" />
                Send Message
              </button>

              {submitted && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  JazakAllah khair. We received your message and will contact you soon.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
