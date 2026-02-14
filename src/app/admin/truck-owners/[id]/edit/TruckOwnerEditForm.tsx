"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Owner = {
  id: string;
  fullName: string;
  bio: string | null;
  serviceRadiusMiles: number | null;
  driverLicenseVerified: boolean;
  insuranceConfirmed: boolean;
  isVerified: boolean;
  user: { email: string };
  pricingProfile: { hourlyRate: { toString: () => string }; minimumJobPrice: { toString: () => string }; perMileRate: { toString: () => string } | null } | null;
};

export function TruckOwnerEditForm({ owner, className = "" }: { owner: Owner; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch(`/api/admin/truck-owners/${owner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fd.get("fullName"),
          bio: fd.get("bio") || undefined,
          serviceRadiusMiles: fd.get("serviceRadiusMiles") ? Number(fd.get("serviceRadiusMiles")) : undefined,
          driverLicenseVerified: fd.get("driverLicenseVerified") === "on",
          insuranceConfirmed: fd.get("insuranceConfirmed") === "on",
          isVerified: fd.get("isVerified") === "on",
          hourlyRate: fd.get("hourlyRate") ? Number(fd.get("hourlyRate")) : undefined,
          minimumJobPrice: fd.get("minimumJobPrice") ? Number(fd.get("minimumJobPrice")) : undefined,
          perMileRate: fd.get("perMileRate") ? Number(fd.get("perMileRate")) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update");
        return;
      }
      router.push("/admin/truck-owners");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-stone-100 p-4 dark:bg-stone-800">
        <p className="text-sm text-stone-600 dark:text-stone-400">{owner.user.email}</p>
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Full name *</label>
        <input id="fullName" name="fullName" type="text" required defaultValue={owner.fullName} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800" />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Bio</label>
        <textarea id="bio" name="bio" rows={3} defaultValue={owner.bio || ""} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800" />
      </div>
      <div>
        <label htmlFor="serviceRadiusMiles" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Service radius (miles)</label>
        <input id="serviceRadiusMiles" name="serviceRadiusMiles" type="number" min="1" max="200" defaultValue={owner.serviceRadiusMiles ?? ""} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800" />
      </div>
      {owner.pricingProfile && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Hourly rate ($)</label>
            <input id="hourlyRate" name="hourlyRate" type="number" min="0" step="0.01" defaultValue={Number(owner.pricingProfile.hourlyRate)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800" />
          </div>
          <div>
            <label htmlFor="minimumJobPrice" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Min job price ($)</label>
            <input id="minimumJobPrice" name="minimumJobPrice" type="number" min="0" step="0.01" defaultValue={Number(owner.pricingProfile.minimumJobPrice)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Verification</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="driverLicenseVerified" defaultChecked={owner.driverLicenseVerified} className="h-4 w-4 rounded text-orange-600" />
            <span className="text-sm">Driver license verified</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="insuranceConfirmed" defaultChecked={owner.insuranceConfirmed} className="h-4 w-4 rounded text-orange-600" />
            <span className="text-sm">Insurance confirmed</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isVerified" defaultChecked={owner.isVerified} className="h-4 w-4 rounded text-orange-600" />
            <span className="text-sm">Verified (show in listings)</span>
          </label>
        </div>
      </div>
      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="rounded-xl bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
          {loading ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-xl border border-stone-300 px-6 py-2 font-semibold dark:border-stone-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
