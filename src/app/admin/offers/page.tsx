import { prisma } from "@/lib/prisma";

export default async function OffersAdminPage() {
  const offers = await prisma.seasonalOffer.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Seasonal offers</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Manage promotional offers. Add new ones via Prisma Studio or seed.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
        <table className="w-full">
          <thead className="bg-stone-100 dark:bg-stone-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Dates</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Promo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
            {offers.map((offer) => (
              <tr key={offer.id} className="bg-white dark:bg-stone-800">
                <td className="px-4 py-3 font-medium">{offer.name}</td>
                <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-400">
                  {offer.startDate.toLocaleDateString()} – {offer.endDate.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {offer.promoCode && (
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                      {offer.promoCode}
                      {offer.discountPct && ` (${Number(offer.discountPct)}% off)`}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {offer.isActive ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Yes</span>
                  ) : (
                    <span className="text-stone-400">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
