import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [truckOwnerCount, jobCount, activeOffers] = await Promise.all([
    prisma.truckOwner.count(),
    prisma.job.count(),
    prisma.seasonalOffer.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Admin dashboard</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Manage truck owners, jobs, and seasonal offers.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/truck-owners"
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-stone-700 dark:bg-stone-800"
        >
          <p className="text-3xl font-bold text-orange-600">{truckOwnerCount}</p>
          <p className="mt-1 text-stone-600 dark:text-stone-400">Truck owners</p>
        </Link>
        <Link
          href="/admin/jobs"
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-stone-700 dark:bg-stone-800"
        >
          <p className="text-3xl font-bold text-orange-600">{jobCount}</p>
          <p className="mt-1 text-stone-600 dark:text-stone-400">Jobs</p>
        </Link>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800">
          <p className="text-3xl font-bold text-orange-600">{activeOffers}</p>
          <p className="mt-1 text-stone-600 dark:text-stone-400">Active seasonal offers</p>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/list-your-truck"
          className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
        >
          List a truck (onboarding)
        </Link>
        <Link
          href="/admin/offers"
          className="rounded-xl border border-orange-600 px-6 py-3 font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
        >
          Manage offers
        </Link>
      </div>
    </div>
  );
}
