"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SERVICE_TYPES, JOB_REQUEST_STORAGE_KEY, type JobRequestData } from "@/lib/constants";

/** Estimate formula: uses truck owner rates + job request details (no external APIs) */
function calculateEstimate(
  jobRequest: JobRequestData | null,
  hourlyRate: number,
  minimumJobPrice: number,
  perMileRate: number
): number {
  if (!jobRequest || jobRequest.services.length === 0) {
    return minimumJobPrice;
  }

  // Base: labor (~1.5 hrs) or minimum, whichever is higher
  let estimate = Math.max(minimumJobPrice, hourlyRate * 1.5);

  // Plowing: add driveway factor (~$1.50/ft)
  const hasPlowing = jobRequest.services.some((s) =>
    ["snow_plowing", "salt_spreading"].includes(s)
  );
  if (hasPlowing) {
    const drivewayFt = jobRequest.drivewayLengthFt ?? 50;
    estimate += drivewayFt * 1.5;
  }

  // Delivery: add mileage (estimate 10 miles for now)
  const hasDelivery = jobRequest.services.some((s) =>
    [
      "pickup_delivery",
      "junk_removal",
      "small_moves",
      "appliance_transport",
      "furniture_transport",
      "mulch_delivery",
      "yard_waste_haul",
      "snow_haul",
      "firewood_delivery",
      "leaf_cleanup_haul",
    ].includes(s)
  );
  if (hasDelivery) {
    const milesRate = perMileRate > 0 ? perMileRate : 2.5;
    estimate += 10 * milesRate;
  }

  // Multiple services: +15% per extra
  if (jobRequest.services.length > 1) {
    estimate *= 1 + 0.15 * (jobRequest.services.length - 1);
  }

  // Recurring discount
  if (jobRequest.isRecurring) {
    estimate *= 0.9;
  }

  return Math.round(estimate * 100) / 100;
}

export function JobRequestForm({
  truckOwnerId,
  hourlyRate,
  minimumJobPrice,
  perMileRate,
  className = "",
}: {
  truckOwnerId: string;
  hourlyRate: number;
  minimumJobPrice: number;
  perMileRate: number;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobRequest, setJobRequest] = useState<JobRequestData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(JOB_REQUEST_STORAGE_KEY);
        if (raw) {
          setJobRequest(JSON.parse(raw) as JobRequestData);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const estimate = calculateEstimate(
    jobRequest,
    hourlyRate,
    minimumJobPrice,
    perMileRate
  );

  const pickupAddress =
    jobRequest?.pickupAddress || jobRequest?.address || "";
  const dropoffAddress = jobRequest?.dropoffAddress || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (!jobRequest) {
      setError("Please start from the Find a truck flow to continue.");
      setLoading(false);
      return;
    }

    if (!pickupAddress) {
      setError("Address or pickup location is required. Please go back and complete your request.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          truckOwnerId,
          customerEmail: fd.get("customerEmail"),
          customerName: fd.get("customerName"),
          customerPhone: fd.get("customerPhone") || undefined,
          serviceType: jobRequest.services[0],
          pickupAddress,
          dropoffAddress: dropoffAddress || undefined,
          description: jobRequest.description || undefined,
          photoUrls: jobRequest.photoUrls ?? [],
          totalAmount: estimate,
          platformFee: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create job");
        return;
      }
      router.push("/find");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!jobRequest) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-amber-800 dark:text-amber-200">
          No job request found. Please start from the beginning to describe what you need.
        </p>
        <Link
          href="/get-started"
          className="mt-4 inline-block text-orange-600 hover:underline"
        >
          Get started →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Selected services (read-only) */}
      <div className="rounded-lg bg-stone-100 p-4 dark:bg-stone-800">
        <h3 className="font-medium text-stone-900 dark:text-stone-100">
          Your request
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {jobRequest.services.map((value) => (
            <span
              key={value}
              className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
            >
              {SERVICE_TYPES.find((t) => t.value === value)?.label ?? value}
            </span>
          ))}
        </div>
        {jobRequest.isRecurring && (
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Recurring job
          </p>
        )}
        {jobRequest.description && (
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {jobRequest.description}
          </p>
        )}
        {jobRequest.photoUrls && jobRequest.photoUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {jobRequest.photoUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-14 w-14 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        <Link
          href="/get-started"
          className="mt-2 inline-block text-sm text-orange-600 hover:underline"
        >
          Change your request
        </Link>
      </div>

      {/* Estimate */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
        <h3 className="font-medium text-stone-900 dark:text-stone-100">
          Estimated total
        </h3>
        <p className="mt-1 text-3xl font-bold text-orange-600">
          ${estimate.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Based on your request and this driver&apos;s rates. Final price may vary.
        </p>
      </div>

      <div className="rounded-lg bg-stone-100 p-4 dark:bg-stone-800">
        <h3 className="font-medium text-stone-900 dark:text-stone-100">
          Your info
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm text-stone-600 dark:text-stone-400"
            >
              Name *
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label
              htmlFor="customerEmail"
              className="block text-sm text-stone-600 dark:text-stone-400"
            >
              Email *
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
        </div>
        <div className="mt-3">
          <label
            htmlFor="customerPhone"
            className="block text-sm text-stone-600 dark:text-stone-400"
          >
            Phone
          </label>
          <input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Request job"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-stone-300 px-6 py-2 font-semibold dark:border-stone-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
