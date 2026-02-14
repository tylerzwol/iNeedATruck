import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const {
      fullName,
      bio,
      serviceRadiusMiles,
      driverLicenseVerified,
      insuranceConfirmed,
      isVerified,
      hourlyRate,
      minimumJobPrice,
      perMileRate,
    } = body;

    await prisma.truckOwner.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(serviceRadiusMiles !== undefined && { serviceRadiusMiles: serviceRadiusMiles ? Number(serviceRadiusMiles) : null }),
        ...(driverLicenseVerified !== undefined && { driverLicenseVerified: Boolean(driverLicenseVerified) }),
        ...(insuranceConfirmed !== undefined && { insuranceConfirmed: Boolean(insuranceConfirmed) }),
        ...(isVerified !== undefined && { isVerified: Boolean(isVerified) }),
      },
    });

    const owner = await prisma.truckOwner.findUnique({
      where: { id },
      include: { pricingProfile: true },
    });
    if (owner?.pricingProfile && (hourlyRate !== undefined || minimumJobPrice !== undefined || perMileRate !== undefined)) {
      await prisma.pricingProfile.update({
        where: { ownerId: id },
        data: {
          ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
          ...(minimumJobPrice !== undefined && { minimumJobPrice: Number(minimumJobPrice) }),
          ...(perMileRate !== undefined && { perMileRate: perMileRate ? Number(perMileRate) : null }),
        },
      });
    }

    const updated = await prisma.truckOwner.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        pricingProfile: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
