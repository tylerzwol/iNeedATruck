import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TruckOwnerEditForm } from "./TruckOwnerEditForm";

export default async function EditTruckOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await prisma.truckOwner.findUnique({
    where: { id },
    include: {
      user: true,
      vehicles: true,
      pricingProfile: true,
      availability: true,
    },
  });
  if (!owner) notFound();

  const ownerForForm = {
    id: owner.id,
    fullName: owner.fullName,
    bio: owner.bio,
    serviceRadiusMiles: owner.serviceRadiusMiles,
    driverLicenseVerified: owner.driverLicenseVerified,
    insuranceConfirmed: owner.insuranceConfirmed,
    isVerified: owner.isVerified,
    user: { email: owner.user.email },
    pricingProfile: owner.pricingProfile
      ? {
          hourlyRate: Number(owner.pricingProfile.hourlyRate),
          minimumJobPrice: Number(owner.pricingProfile.minimumJobPrice),
          perMileRate: owner.pricingProfile.perMileRate ? Number(owner.pricingProfile.perMileRate) : null,
        }
      : null,
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href="/admin/truck-owners" className="text-sm text-orange-600 hover:underline">← Back to truck owners</Link>
      <h1 className="mt-6 text-2xl font-bold text-stone-900 dark:text-stone-100">Edit truck owner</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">{owner.fullName}</p>
      <TruckOwnerEditForm owner={ownerForForm} className="mt-8" />
    </div>
  );
}
