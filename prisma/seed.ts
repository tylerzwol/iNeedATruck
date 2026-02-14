import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const SERVICE_TYPES = [
  "pickup_delivery",
  "junk_removal",
  "small_moves",
  "appliance_transport",
  "furniture_transport",
  "mulch_delivery",
  "yard_waste_haul",
  "snow_plowing",
  "salt_spreading",
  "snow_haul",
  "firewood_delivery",
  "leaf_cleanup_haul",
] as const;

async function main() {
  // Demo truck owner
  const truckOwnerUser = await prisma.user.upsert({
    where: { email: "truck@demo.local" },
    create: {
      email: "truck@demo.local",
      name: "Mike Johnson",
      emailVerified: true,
      phone: "555-123-4567",
      phoneVerified: true,
      role: "truck_owner",
    },
    update: {},
  });

  const truckOwner = await prisma.truckOwner.upsert({
    where: { userId: truckOwnerUser.id },
    create: {
      userId: truckOwnerUser.id,
      fullName: "Mike Johnson",
      phoneNumber: "555-123-4567",
      serviceRadiusMiles: 25,
      zipCodes: [],
      bio: "Local pickup and flatbed. Available for hauls, moves, and seasonal work. Reliable and insured.",
      driverLicenseVerified: true,
      insuranceConfirmed: true,
      backgroundCheckConsent: true,
      platformFeePct: 15,
      membershipTier: "standard",
      isVerified: true,
      totalJobsCompleted: 42,
      ratingAvg: 4.8,
    },
    update: {},
  });

  const existingVehicle = await prisma.vehicle.findFirst({ where: { ownerId: truckOwner.id } });
  if (!existingVehicle) {
    await prisma.vehicle.create({
      data: {
        ownerId: truckOwner.id,
        vehicleType: "pickup",
        bedLengthFt: 8,
        payloadCapacityLbs: 2000,
        towingCapable: true,
        towCapacityLbs: 10000,
        hitchType: "2-inch ball",
        awdOr4wd: true,
        hasRamps: true,
        hasStraps: true,
        hasMovingBlankets: true,
        hasPlow: true,
      },
    });
  }

  await prisma.pricingProfile.upsert({
    where: { ownerId: truckOwner.id },
    create: {
      ownerId: truckOwner.id,
      hourlyRate: 75,
      minimumJobPrice: 50,
      perMileRate: 2.5,
      emergencySurchargeEnabled: true,
    },
    update: {},
  });

  await prisma.availability.upsert({
    where: { ownerId: truckOwner.id },
    create: {
      ownerId: truckOwner.id,
      availabilityType: "custom",
      dailyHours: {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
        saturday: { start: "09:00", end: "12:00" },
        sunday: null,
      },
      seasonalAvailability: ["winter", "spring", "summer", "fall"],
      acceptsSameDayJobs: true,
    },
    update: {},
  });

  // Service offerings
  for (const st of ["pickup_delivery", "junk_removal", "small_moves", "snow_plowing", "salt_spreading", "mulch_delivery", "yard_waste_haul"]) {
    await prisma.serviceOffering.upsert({
      where: {
        ownerId_serviceType: { ownerId: truckOwner.id, serviceType: st },
      },
      create: {
        ownerId: truckOwner.id,
        serviceType: st,
        seasonalTag: ["snow_plowing", "salt_spreading", "snow_haul"].includes(st) ? "winter" : ["mulch_delivery", "yard_waste_haul", "leaf_cleanup_haul"].includes(st) ? "spring" : "all",
      },
      update: {},
    });
  }

  // Demo customer
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@demo.local" },
    create: {
      email: "customer@demo.local",
      name: "Jane Doe",
      phone: "555-987-6543",
      role: "customer",
    },
    update: {},
  });

  await prisma.customer.upsert({
    where: { userId: customerUser.id },
    create: { userId: customerUser.id, address: "123 Main St" },
    update: {},
  });

  // Seasonal offers
  const now = new Date();
  const winterStart = new Date(now.getFullYear(), 10, 1);
  const winterEnd = new Date(now.getFullYear() + 1, 2, 28);
  const springStart = new Date(now.getFullYear(), 2, 1);
  const springEnd = new Date(now.getFullYear(), 5, 30);

  await prisma.seasonalOffer.upsert({
    where: { slug: "winter-plow-2025" },
    create: {
      slug: "winter-plow-2025",
      name: "Winter Plow Specials",
      description: "Book driveway plowing for the season. Save 10% on recurring bookings.",
      startDate: winterStart,
      endDate: winterEnd,
      isActive: true,
      promoCode: "PLOW25",
      discountPct: 10,
    },
    update: {},
  });

  await prisma.seasonalOffer.upsert({
    where: { slug: "spring-yard-2025" },
    create: {
      slug: "spring-yard-2025",
      name: "Spring Yard Hauls",
      description: "Yard cleanup, mulch delivery, debris removal. Get your yard ready for summer.",
      startDate: springStart,
      endDate: springEnd,
      isActive: true,
      promoCode: "YARD25",
      discountPct: 15,
    },
    update: {},
  });

  console.log("Seeded demo truck owner (with vehicle, pricing, availability, services), customer, and seasonal offers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
