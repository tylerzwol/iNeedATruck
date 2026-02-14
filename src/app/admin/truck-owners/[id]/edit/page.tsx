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

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href="/admin/truck-owners" className="text-sm text-orange-600 hover:underline">← Back to truck owners</Link>
      <h1 className="mt-6 text-2xl font-bold text-stone-900 dark:text-stone-100">Edit truck owner</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">{owner.fullName}</p>
      <TruckOwnerEditForm owner={owner} className="mt-8" />
    </div>
  );
}
