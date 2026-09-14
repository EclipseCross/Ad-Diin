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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSubmitted(false);

    try {
      // IMPORTANT:
      // Direct Laravel backend URL
      const backendUrl =
        import.meta.env.VITE_BACKEND_ENDPOINT ||
        'http://127.0.0.1:8000';

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
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-100/50 px-4 py-10 md:px-8 md:py-14">

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl rounded-3xl border border-emerald-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,185,129,0.12)] backdrop-blur md:p-8 lg:p-10">

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">

          {/* =========================================
              LEFT SIDE
          ========================================= */}
          <div className="flex flex-col justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">
                Contact Us
              </p>

              <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Get In Touch
                <br />
                With Ad-Diin
              </h1>

              <p className="mt-4 max-w-lg text-base text-slate-600">
                Questions about prayer schedules, activities, donations,
                or Milad booking? Our team is here to help. Send your
                message and we will respond as soon as possible.
              </p>

              {/* Messaging CTA */}
              <div className="mt-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-emerald-50 p-4">

                <div className="flex items-start gap-3">

                  <MessageCircle className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />

                  <div className="flex-1">

                    <p className="mb-1 font-semibold text-slate-900">
                      Want Real-Time Chat?
                    </p>

                    <p className="mb-3 text-sm text-slate-600">
                      Use our messaging system to chat with our support
                      team instantly, just like WhatsApp or Messenger.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/messaging')}
                      className="text-sm font-bold text-blue-600 underline hover:text-blue-700"
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
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">

                <span className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <Mail className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Email
                  </p>

                  <p className="font-bold text-slate-800">
                    info@ad-diin.org
                  </p>
                </div>

              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">

                <span className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <Phone className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Phone
                  </p>

                  <p className="font-bold text-slate-800">
                    +880 1234 567890
                  </p>
                </div>

              </div>

              {/* Address */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">

                <span className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Address
                  </p>

                  <p className="font-bold text-slate-800">
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
                    className="rounded-xl border border-emerald-200 bg-white p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:text-emerald-700"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-emerald-200 bg-white p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:text-emerald-700"
                  >
                    <Instagram className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-emerald-200 bg-white p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:text-emerald-700"
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
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />

              </div>

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />

              </div>

              {/* Company */}
              <div>

                <label
                  htmlFor="company"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Company (Optional)
                </label>

                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Organization name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />

              </div>

              {/* Message */}
              <div>

                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Your Message
                </label>

                <textarea
                  id="message"
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ✓ JazakAllah khair. We received your message and will
                  contact you soon.
                  <br />
                  A confirmation email has been sent to your inbox.
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