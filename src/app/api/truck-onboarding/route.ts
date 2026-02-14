import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      fullName,
      phoneNumber,
      profilePhotoUrl,
      driverLicenseFrontUrl,
      driverLicenseBackUrl,
      insuranceFrontUrl,
      insuranceBackUrl,
      serviceRadiusMiles,
      zipCodes,
      bio,
      driverLicenseVerified,
      insuranceConfirmed,
      backgroundCheckConsent,
      vehicle,
      serviceOfferings,
      pricing,
      availability,
    } = body;

    if (!email || !fullName || !phoneNumber) {
      return NextResponse.json(
        { error: "Email, full name, and phone number are required" },
        { status: 400 }
      );
    }

    if (!vehicle?.vehicleType || vehicle.bedLengthFt == null || vehicle.payloadCapacityLbs == null) {
      return NextResponse.json(
        { error: "Vehicle type, bed length, and payload capacity are required" },
        { status: 400 }
      );
    }

    if (!pricing?.hourlyRate || pricing.minimumJobPrice == null) {
      return NextResponse.json(
        { error: "Hourly rate and minimum job price are required" },
        { status: 400 }
      );
    }

    if (!driverLicenseVerified || !insuranceConfirmed || !backgroundCheckConsent) {
      return NextResponse.json(
        { error: "Driver license confirmation, insurance confirmation, and background check consent are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      const existingOwner = await prisma.truckOwner.findUnique({
        where: { userId: existingUser.id },
      });
      if (existingOwner) {
        return NextResponse.json(
          { error: "This email is already registered as a truck owner" },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: fullName,
        phone: phoneNumber,
        role: "truck_owner",
      },
      update: {
        name: fullName,
        phone: phoneNumber,
        role: "truck_owner",
      },
    });

    const truckOwner = await prisma.truckOwner.create({
      data: {
        userId: user.id,
        fullName,
        phoneNumber,
        profilePhotoUrl: profilePhotoUrl || null,
        driverLicenseFrontUrl: driverLicenseFrontUrl || null,
        driverLicenseBackUrl: driverLicenseBackUrl || null,
        insuranceFrontUrl: insuranceFrontUrl || null,
        insuranceBackUrl: insuranceBackUrl || null,
        serviceRadiusMiles: serviceRadiusMiles ? Number(serviceRadiusMiles) : null,
        zipCodes: Array.isArray(zipCodes) ? zipCodes : [],
        bio: bio || null,
        driverLicenseVerified: Boolean(driverLicenseVerified),
        insuranceConfirmed: Boolean(insuranceConfirmed),
        backgroundCheckConsent: Boolean(backgroundCheckConsent),
      },
    });

    await prisma.vehicle.create({
      data: {
        ownerId: truckOwner.id,
        vehicleType: vehicle.vehicleType,
        bedLengthFt: Number(vehicle.bedLengthFt),
        payloadCapacityLbs: Number(vehicle.payloadCapacityLbs),
        towingCapable: Boolean(vehicle.towingCapable),
        towCapacityLbs: vehicle.towCapacityLbs ? Number(vehicle.towCapacityLbs) : null,
        awdOr4wd: Boolean(vehicle.awdOr4wd),
        hitchType: vehicle.hitchType || null,
        trailerSizeFt: vehicle.trailerSizeFt ? Number(vehicle.trailerSizeFt) : null,
        trailerCapacityLbs: vehicle.trailerCapacityLbs ? Number(vehicle.trailerCapacityLbs) : null,
        hasRamps: Boolean(vehicle.hasRamps),
        hasDolly: Boolean(vehicle.hasDolly),
        hasStraps: Boolean(vehicle.hasStraps),
        hasMovingBlankets: Boolean(vehicle.hasMovingBlankets),
        hasPlow: Boolean(vehicle.hasPlow),
      },
    });

    if (Array.isArray(serviceOfferings) && serviceOfferings.length > 0) {
      await prisma.serviceOffering.createMany({
        data: serviceOfferings.map((s: { serviceType: string; seasonalTag: string }) => ({
          ownerId: truckOwner.id,
          serviceType: s.serviceType,
          seasonalTag: s.seasonalTag || "all",
        })),
      });
    }

    await prisma.pricingProfile.create({
      data: {
        ownerId: truckOwner.id,
        hourlyRate: Number(pricing.hourlyRate),
        minimumJobPrice: Number(pricing.minimumJobPrice),
        perMileRate: pricing.perMileRate ? Number(pricing.perMileRate) : null,
        emergencySurchargeEnabled: Boolean(pricing.emergencySurchargeEnabled),
      },
    });

    const dailyHours = availability?.dailyHours && typeof availability.dailyHours === "object"
      ? (availability.dailyHours as Record<string, { start: string; end: string } | null>)
      : null;

    await prisma.availability.create({
      data: {
        ownerId: truckOwner.id,
        availabilityType: "custom",
        dailyHours: dailyHours ?? undefined,
        seasonalAvailability: Array.isArray(availability?.seasonalAvailability) ? availability.seasonalAvailability : [],
        acceptsSameDayJobs: availability?.acceptsSameDayJobs !== false,
      },
    });

    return NextResponse.json({
      success: true,
      truckOwnerId: truckOwner.id,
    });
  } catch (err) {
    console.error("Truck onboarding error:", err);
    const message = err instanceof Error ? err.message : "Failed to complete onboarding";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
