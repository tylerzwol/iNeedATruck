import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createJobSchema } from "@/lib/validations/job";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      truckOwnerId,
      customerEmail,
      customerName,
      customerPhone,
      serviceType,
      pickupAddress,
      dropoffAddress,
      description,
      photoUrls,
      totalAmount,
      platformFee,
    } = body;

    const truckOwner = await prisma.truckOwner.findUnique({
      where: { id: truckOwnerId },
    });
    if (!truckOwner) {
      return NextResponse.json({ error: "Truck owner not found" }, { status: 404 });
    }

    let customerUser = await prisma.user.findUnique({
      where: { email: customerEmail },
    });
    if (!customerUser) {
      customerUser = await prisma.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone || null,
          role: "customer",
        },
      });
      await prisma.customer.create({
        data: { userId: customerUser.id },
      });
    }

    const platformFeeVal = platformFee ?? totalAmount * (Number(truckOwner.platformFeePct) / 100);
    const data = createJobSchema.parse({
      customerId: customerUser.id,
      truckOwnerId: truckOwner.id,
      serviceType: serviceType || undefined,
      pickupAddress,
      dropoffAddress: dropoffAddress || undefined,
      description: description || undefined,
      photoUrls: Array.isArray(photoUrls) ? photoUrls.slice(0, 5) : [],
      totalAmount: Number(totalAmount),
      platformFee: Number(platformFeeVal),
    });

    const job = await prisma.job.create({
      data: {
        customerId: data.customerId,
        truckOwnerId: data.truckOwnerId,
        serviceType: data.serviceType,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        description: data.description,
        photoUrls: data.photoUrls ?? [],
        totalAmount: data.totalAmount,
        platformFee: data.platformFee,
      },
      include: {
        customer: { select: { name: true, email: true } },
        truckOwner: { select: { fullName: true } },
      },
    });

    return NextResponse.json(job);
  } catch (err) {
    const { ZodError } = await import("zod");
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    throw err;
  }
}
