import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VEHICLE_TYPES, SERVICE_TYPES } from "@/lib/constants";

export default async function TruckOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await prisma.truckOwner.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      vehicles: true,
      pricingProfile: true,
      serviceOfferings: true,
      availability: true,
    },
  });

  if (!owner) notFound();

  const vehicleTypeLabel = VEHICLE_TYPES.find((v) => v.value === owner.vehicles[0]?.vehicleType)?.label ?? owner.vehicles[0]?.vehicleType;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/find" className="text-sm text-orange-600 hover:underline">← Back to listings</Link>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {owner.fullName}
            </h1>
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              {vehicleTypeLabel}
              {owner.vehicles[0] && ` • ${owner.vehicles[0].bedLengthFt}ft bed • ${owner.vehicles[0].payloadCapacityLbs} lbs payload`}
            </p>
            {owner.isVerified && (
              <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                Verified
              </span>
            )}
          </div>
          {owner.pricingProfile && (
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">${Number(owner.pricingProfile.hourlyRate)}/hr</p>
              <p className="text-xs text-stone-500">Min: ${Number(owner.pricingProfile.minimumJobPrice)}</p>
            </div>
          )}
        </div>
        {owner.bio && (
          <p className="mt-6 text-stone-600 dark:text-stone-400">{owner.bio}</p>
        )}

        {owner.serviceOfferings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Services</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {owner.serviceOfferings.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700 dark:bg-stone-700 dark:text-stone-300"
                >
                  {SERVICE_TYPES.find((t) => t.value === s.serviceType)?.label ?? s.serviceType}
                  {s.seasonalTag !== "all" && ` (${s.seasonalTag})`}
                </span>
              ))}
            </div>
          </div>
        )}

        {owner.vehicles[0] && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Equipment</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {owner.vehicles[0].hasRamps && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-700">Ramps</span>}
              {owner.vehicles[0].hasStraps && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-700">Straps</span>}
              {owner.vehicles[0].hasMovingBlankets && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-700">Blankets</span>}
              {owner.vehicles[0].hasPlow && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-700">Plow</span>}
              {owner.vehicles[0].towingCapable && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-700">Towing</span>}
              {owner.vehicles[0].awdOr4wd && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-700">AWD/4WD</span>}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link
            href={`/jobs/new?truckOwnerId=${owner.id}`}
            className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Request a job
          </Link>
        </div>
      </div>
    </div>
  );
}
