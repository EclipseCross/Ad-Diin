import { HeroSection } from '../components/HeroSection';
import { PrayerTimes } from '../components/PrayerTimes';
import { OngoingActivities } from '../components/OngoingActivities';
import { DonationFunds } from '../components/DonationFunds';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PrayerTimes />
      <OngoingActivities />
      <DonationFunds />
    </div>
  );
}
