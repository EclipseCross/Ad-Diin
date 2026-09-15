import { FormEvent, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  SendHorizontal,
  MessageCircle,
  Loader2,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../api';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const remainingCharacters = 2000 - message.length;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSubmitted(false);

    try {
      // IMPORTANT:
      // Direct Laravel backend URL
      const backendUrl = apiBaseUrl;

      const response = await fetch(
        `${backendUrl}/api/v1/contact`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },

          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim(),
            company: company.trim() || null,
            message: message.trim(),
          }),
        }
      );

      // Try to read JSON response
      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log('Contact API Status:', response.status);
      console.log('Contact API Response:', data);

      // HTTP error
      if (!response.ok) {
        setError(
          data?.message ||
          `Server error (${response.status}). Please try again.`
        );

        return;
      }

      // Laravel success response
      if (data?.success === true) {
        setSubmitted(true);

        setFullName('');
        setEmail('');
        setCompany('');
        setMessage('');

        return;
      }

      // Unexpected response
      setError(
        data?.message ||
        'Something went wrong. Please try again.'
      );

    } catch (err) {
      console.error('Contact API Error:', err);

      setError(
        'Network error. Please check that the Laravel server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-transparent px-4 py-10 md:px-8 md:py-16">

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-br from-emerald-100/80 via-teal-50/70 to-transparent" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl text-white">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            <MessageCircle className="h-3.5 w-3.5" /> Support center
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Let&apos;s talk.</h1>
          <p className="mt-4 text-base leading-7 text-emerald-50/75 md:text-lg">
            Send a message to the Ad-Diin team or continue in live support. We are here to help with your Islamic journey.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">

          {/* =========================================
              LEFT SIDE
          ========================================= */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/55 p-6 text-white shadow-2xl backdrop-blur-xl md:p-8">

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur-xl md:p-8">
              <div className="mb-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-emerald-600" /> Replies within 1 business day</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Your details stay private</span>
              </div>

              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                Questions about prayer schedules, activities, donations,
                or Milad booking? Our team is here to help. Send your
                message and we will respond as soon as possible.
              </p>

              {/* Messaging CTA */}
              <div className="mt-7 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">

                <div className="flex items-start gap-3">

                  <MessageCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />

                  <div className="flex-1">

                    <p className="mb-1 font-semibold text-white">
                      Want Real-Time Chat?
                    </p>

                    <p className="mb-3 text-sm leading-6 text-emerald-50/75">
                      Use our messaging system to chat with our support
                      team instantly, just like WhatsApp or Messenger.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/messaging')}
                      className="inline-flex rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-400"
                    >
                      Open Messaging →
                    </button>

                  </div>
                </div>
              </div>

            </div>

            {/* Contact information */}
            <div className="mt-7 space-y-3">

              {/* Email */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">

                <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
                  <Mail className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-emerald-100/55">
                    Email
                  </p>

                  <p className="font-bold text-white">
                    info@ad-diin.org
                  </p>
                </div>

              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">

                <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
                  <Phone className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Phone
                  </p>

                  <p className="font-bold text-white">
                    +880 1234 567890
                  </p>
                </div>

              </div>

              {/* Address */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">

                <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
                  <MapPin className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Address
                  </p>

                  <p className="font-bold text-white">
                    Mosque Street, Dhaka, Bangladesh
                  </p>
                </div>

              </div>

              {/* Social */}
              <div className="pt-2">

                <p className="mb-3 text-sm font-semibold text-slate-600">
                  Reach us on
                </p>

                <div className="flex gap-2">

                  <button
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-slate-300 transition hover:-translate-y-0.5 hover:text-emerald-300"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-slate-300 transition hover:-translate-y-0.5 hover:text-emerald-300"
                  >
                    <Instagram className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-slate-300 transition hover:-translate-y-0.5 hover:text-emerald-300"
                  >
                    <Linkedin className="h-5 w-5" />
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* =========================================
              RIGHT SIDE - FORM
          ========================================= */}
          <div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Full Name */}
              <div>

                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-semibold text-emerald-100/70"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />

              </div>

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-emerald-100/70"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />

              </div>

              {/* Company */}
              <div>

                <label
                  htmlFor="company"
                  className="mb-1.5 block text-sm font-semibold text-emerald-100/70"
                >
                  Company (Optional)
                </label>

                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Organization name"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />

              </div>

              {/* Message */}
              <div>

                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-semibold text-emerald-100/70"
                >
                  Your Message
                </label>

                <textarea
                  id="message"
                  rows={6}
                  required
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
                <p className="mt-1 text-right text-xs text-slate-400">{remainingCharacters} characters left</p>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4" />
                    Send Message
                  </>
                )}

              </button>

              {/* Success */}
              {submitted && (
                <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>JazakAllah khair. We received your message and will contact you soon.<br />A confirmation email has been sent to your inbox.</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

            </form>

          </div>

        </div>

      </div>

    </section>
  );
}