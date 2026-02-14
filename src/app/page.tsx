import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-stone-100 p-6 dark:bg-stone-900">
      <main className="flex max-w-lg flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          iNeedATruck
        </h1>
        <p className="mt-4 text-lg text-stone-700 dark:text-stone-300">
          Connect with local truck owners. Hauls, moves, plowing, yard work—book a truck near you.
        </p>
        <div className="mt-10 flex flex-col gap-4">
          <Link
            href="/get-started"
            className="rounded-xl bg-orange-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Find a truck
          </Link>
          <Link
            href="/offers"
            className="rounded-xl border border-orange-600 px-8 py-4 font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
          >
            Seasonal offers
          </Link>
          <p className="mt-6 text-sm text-stone-500">
            Truck owner? <Link href="/list-your-truck" className="text-orange-600 hover:underline">List your truck →</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
