import { z } from "zod";

export const createTruckOwnerSchema = z.object({
  userId: z.string().cuid(),
  bio: z.string().optional(),
  truckType: z.string().min(1),
  capacity: z.string().optional(),
  hourlyRate: z.number().positive(),
  platformFeePct: z.number().min(0).max(100).optional(),
  membershipTier: z.enum(["standard", "premium"]).optional(),
});
