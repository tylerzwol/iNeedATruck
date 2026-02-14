import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FindPageHeader } from "./FindPageHeader";
import { SERVICE_TYPES } from "@/lib/constants";

const VALID_SERVICE_VALUES = new Set(SERVICE_TYPES.map((s) => s.value));

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ services?: string }>;
}) {
  const { services: servicesParam } = await searchParams;
  const requestedServices =
    servicesParam
      ?.split(",")
      .map((s) => s.trim())
      .filter((s) => VALID_SERVICE_VALUES.has(s)) ?? [];

  const truckOwners = await prisma.truckOwner.findMany({
    where:
      requestedServices.length > 0
        ? {
            serviceOfferings: {
              some: { serviceType: { in: requestedServices } },
            },
          }
        : undefined,
    include: {
      vehicles: { take: 1 },
      pricingProfile: true,
      serviceOfferings: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serviceLabels =
    requestedServices.length > 0
      ? requestedServices
          .map((v) => SERVICE_TYPES.find((s) => s.value === v)?.label ?? v)
          .join(", ")
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <FindPageHeader requestedServices={requestedServices} />

      {serviceLabels && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-orange-200 bg-orange-50/50 px-4 py-3 dark:border-orange-900/50 dark:bg-orange-950/30">
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Showing trucks that offer: {serviceLabels}
          </span>
          <Link
            href="/find"
            className="text-sm text-orange-600 hover:underline dark:text-orange-400"
          >
            Show all trucks
          </Link>
        </div>
      )}

      {truckOwners.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-600 dark:bg-stone-800/50">
          <p className="text-stone-600 dark:text-stone-400">
            {requestedServices.length > 0
              ? "No truck owners offer these services yet. Try different services or browse all trucks."
              : "No truck owners listed yet."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {requestedServices.length > 0 && (
              <Link href="/find" className="text-orange-600 hover:underline">
                Browse all trucks →
              </Link>
            )}
            <Link href="/list-your-truck" className="text-orange-600 hover:underline">
              List your truck →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {truckOwners.map((owner) => {
            const offeredServiceTypes = owner.serviceOfferings.map((s) => s.serviceType);
            const matchedServices =
              requestedServices.length > 0
                ? requestedServices.filter((s) => offeredServiceTypes.includes(s))
                : offeredServiceTypes.slice(0, 4);
            return (
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
                    {matchedServices.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {matchedServices.map((st) => (
                          <span
                            key={st}
                            className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-400"
                          >
                            {SERVICE_TYPES.find((s) => s.value === st)?.label ?? st}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {owner.pricingProfile && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                      ${Number(owner.pricingProfile.hourlyRate)}/hr
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
