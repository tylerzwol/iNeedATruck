// Admin no longer creates truck owners directly — use /api/truck-onboarding
// This route kept for potential future admin bulk operations
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const owners = await prisma.truckOwner.findMany({
    include: {
      user: { select: { email: true } },
      vehicles: { take: 1 },
      pricingProfile: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(owners);
}
