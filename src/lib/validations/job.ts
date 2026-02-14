import { z } from "zod";

export const createJobSchema = z.object({
  customerId: z.string().cuid(),
  truckOwnerId: z.string().cuid(),
  serviceType: z.string().optional(),
  pickupAddress: z.string().min(1),
  dropoffAddress: z.string().optional(),
  description: z.string().optional(),
  photoUrls: z.array(z.string().min(1)).max(5).optional(),
  totalAmount: z.number().positive(),
  platformFee: z.number().min(0),
  scheduledAt: z.string().datetime().optional(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "in_progress", "completed", "cancelled"]),
});
