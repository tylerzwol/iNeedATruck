import Link from "next/link";

export default function OnboardingSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
        <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">You're all set!</h1>
      <p className="mt-3 text-stone-600 dark:text-stone-400">
        Your truck is listed. We'll review your profile and you'll start receiving job requests soon.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/find" className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700">
          Browse all trucks
        </Link>
        <Link href="/" className="rounded-xl border border-stone-300 px-6 py-3 font-semibold dark:border-stone-600">
          Back to home
        </Link>
      </div>
    </div>
  );
}
