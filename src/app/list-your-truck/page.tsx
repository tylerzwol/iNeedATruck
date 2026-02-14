import { TruckOnboardingWizard } from "./TruckOnboardingWizard";

export const metadata = {
  title: "List your truck | iNeedATruck",
  description: "Onboard your truck and start earning. Fast, simple signup for local truck owners.",
};

export default function ListYourTruckPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
          List your truck
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Join local truck owners. Couch pickups, junk hauls, small moves, snow plowing—get more jobs.
        </p>
      </div>
      <TruckOnboardingWizard />
    </div>
  );
}
