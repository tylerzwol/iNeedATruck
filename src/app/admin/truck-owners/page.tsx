import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TruckOwnersPage() {
  const owners = await prisma.truckOwner.findMany({
    include: {
      user: { select: { email: true } },
      vehicles: { take: 1 },
      pricingProfile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Truck owners</h1>
        <Link
          href="/list-your-truck"
          className="rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
        >
          List a truck (onboarding)
        </Link>
      </div>

      {owners.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-600 dark:bg-stone-800/50">
          <p className="text-stone-600 dark:text-stone-400">No truck owners yet.</p>
          <Link href="/list-your-truck" className="mt-4 inline-block text-orange-600 hover:underline">
            Send truck owners to list their truck →
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
          <table className="w-full">
            <thead className="bg-stone-100 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Vehicle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-stone-900 dark:text-stone-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {owners.map((owner) => (
                <tr key={owner.id} className="bg-white dark:bg-stone-800">
                  <td className="px-4 py-3">
                    <Link href={`/find/${owner.id}`} className="font-medium text-orange-600 hover:underline">
                      {owner.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {owner.vehicles[0]
                      ? `${owner.vehicles[0].vehicleType.replace(/_/g, " ")} • ${owner.vehicles[0].bedLengthFt}ft`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {owner.pricingProfile ? `$${Number(owner.pricingProfile.hourlyRate)}/hr` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {owner.isVerified ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/truck-owners/${owner.id}/edit`} className="text-sm text-orange-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
