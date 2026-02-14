import { JobRequestForm } from "./JobRequestForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ truckOwnerId?: string }>;
}) {
  const { truckOwnerId } = await searchParams;
  if (!truckOwnerId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <p className="text-stone-600 dark:text-stone-400">Select a truck owner from the Find page first.</p>
      </div>
    );
  }

  const truckOwner = await prisma.truckOwner.findUnique({
    where: { id: truckOwnerId },
    include: {
      pricingProfile: true,
      serviceOfferings: true,
    },
  });
  if (!truckOwner) notFound();

  const hourlyRate = Number(truckOwner.pricingProfile?.hourlyRate ?? 0);
  const minimumJobPrice = Number(truckOwner.pricingProfile?.minimumJobPrice ?? 50);
  const perMileRate = Number(truckOwner.pricingProfile?.perMileRate ?? 2.5);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Request a job</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Booking with {truckOwner.fullName} • ${hourlyRate}/hr
      </p>
      <JobRequestForm
        truckOwnerId={truckOwnerId}
        hourlyRate={hourlyRate}
        minimumJobPrice={minimumJobPrice}
        perMileRate={perMileRate}
        className="mt-8"
      />
    </div>
  );
}
