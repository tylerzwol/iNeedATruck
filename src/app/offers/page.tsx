import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function OffersPage() {
  const offers = await prisma.seasonalOffer.findMany({
    where: { isActive: true },
    orderBy: { startDate: "asc" },
  });

  const now = new Date();
  const activeOffers = offers.filter(
    (o) => o.startDate <= now && o.endDate >= now
  );
  const upcomingOffers = offers.filter((o) => o.startDate > now);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Seasonal offers
      </h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Special promotions throughout the year. Save on hauls, plowing, and more.
      </p>

      {activeOffers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
            Active now
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-xl border-2 border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-950/30"
              >
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  {offer.name}
                </h3>
                {offer.description && (
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    {offer.description}
                  </p>
                )}
                {offer.promoCode && (
                  <p className="mt-3 text-sm font-medium text-orange-700 dark:text-orange-300">
                    Use code: {offer.promoCode}
                    {offer.discountPct && ` — ${Number(offer.discountPct)}% off`}
                  </p>
                )}
                <p className="mt-2 text-xs text-stone-500">
                  {offer.startDate.toLocaleDateString()} – {offer.endDate.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcomingOffers.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
            Coming soon
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {upcomingOffers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
              >
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  {offer.name}
                </h3>
                {offer.description && (
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    {offer.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-stone-500">
                  Starts {offer.startDate.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {offers.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-600 dark:bg-stone-800/50">
          <p className="text-stone-600 dark:text-stone-400">No seasonal offers yet.</p>
        </div>
      )}

      <div className="mt-12">
        <Link href="/find" className="text-orange-600 hover:underline">
          ← Find a truck
        </Link>
      </div>
    </div>
  );
}
