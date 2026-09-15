/**
 * Home.tsx
 * ────────
 * Entry point for the Ad-Diin Home page.
 *
 * Delegates entirely to ImmersiveHome which renders:
 *   • A fixed, continuous WebGL 3D mosque scene (Three.js / React Three Fiber)
 *   • Scroll-driven camera animation through 8 cinematic keyframes
 *   • All content sections as HTML overlays above the 3D canvas
 *   • Real API integrations (Prayer Times, Events, Activities, Donations, AI)
 *   • Existing reusable components (PrayerTimes, OngoingActivities, DonationFunds)
 *   • WebGL fallback for unsupported browsers
 *   • Loading screen
 *   • Accessibility (prefers-reduced-motion, keyboard nav, ARIA)
 *
 * The Header and Footer are rendered by App.tsx — untouched.
 * All existing routes are preserved and connected.
 * No backend controllers, APIs, or database tables were modified.
 */

import ImmersiveHome from '../components/mosque3d/ImmersiveHome';

export default function Home() {
  return <ImmersiveHome />;
}
