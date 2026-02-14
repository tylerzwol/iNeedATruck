import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FindPageHeader } from "./FindPageHeader";

export default async function FindPage() {
  const truckOwners = await prisma.truckOwner.findMany({
    include: {
      vehicles: { take: 1 },
      pricingProfile: true,
      serviceOfferings: { take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <FindPageHeader />

      {truckOwners.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-600 dark:bg-stone-800/50">
          <p className="text-stone-600 dark:text-stone-400">No truck owners listed yet.</p>
          <Link href="/list-your-truck" className="mt-4 inline-block text-orange-600 hover:underline">
            List your truck →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {truckOwners.map((owner) => (
            <Link
              key={owner.id}
              href={`/find/${owner.id}`}
              className="block rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                      {owner.fullName}
                    </h2>
                    {owner.isVerified && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {owner.vehicles[0]
                      ? `${owner.vehicles[0].vehicleType.replace(/_/g, " ")} • ${owner.vehicles[0].bedLengthFt}ft bed`
                      : "—"}
                  </p>
                  {owner.bio && (
                    <p className="mt-2 line-clamp-2 text-sm text-stone-500">{owner.bio}</p>
                  )}
                </div>
                {owner.pricingProfile && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                    ${Number(owner.pricingProfile.hourlyRate)}/hr
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
