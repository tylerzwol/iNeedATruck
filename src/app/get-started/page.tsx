"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SERVICE_TYPES, JOB_REQUEST_STORAGE_KEY } from "@/lib/constants";

const MAX_PHOTOS = 5;

const PLOWING_SERVICES = ["snow_plowing", "salt_spreading"];
const DELIVERY_SERVICES = [
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
];

function needsPlowingInfo(selected: string[]) {
  return selected.some((s) => PLOWING_SERVICES.includes(s));
}

function needsDeliveryInfo(selected: string[]) {
  return selected.some((s) => DELIVERY_SERVICES.includes(s));
}

export default function GetStartedPage() {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [address, setAddress] = useState("");
  const [drivewayLengthFt, setDrivewayLengthFt] = useState<string>("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || photoUrls.length >= MAX_PHOTOS) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.url) {
        setPhotoUrls((prev) => [...prev, json.url]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(index: number) {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleService(value: string) {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  const showPlowing = needsPlowingInfo(selectedServices);
  const showDelivery = needsDeliveryInfo(selectedServices);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedServices.length === 0) {
      setError("Please select at least one service.");
      return;
    }

    if (showPlowing && !address.trim()) {
      setError("Please enter the address for plowing.");
      return;
    }

    if (showDelivery && !pickupAddress.trim()) {
      setError("Please enter the pickup address (Point A).");
      return;
    }

    const jobRequest = {
      services: selectedServices,
      isRecurring,
      address: showPlowing ? address : undefined,
      drivewayLengthFt: showPlowing && drivewayLengthFt ? Number(drivewayLengthFt) : undefined,
      pickupAddress: showDelivery ? pickupAddress : undefined,
      dropoffAddress: showDelivery ? dropoffAddress : undefined,
      description: description.trim() || undefined,
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(JOB_REQUEST_STORAGE_KEY, JSON.stringify(jobRequest));
    }

    const servicesParam = selectedServices.length > 0 ? `?services=${encodeURIComponent(selectedServices.join(","))}` : "";
    router.push(`/find${servicesParam}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          What do you need?
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Select your services and share a few details. We&apos;ll match you with local truck owners.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Service selector */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Services needed
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Select all that apply
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SERVICE_TYPES.map((s) => {
              const selected = selectedServices.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleService(s.value)}
                  className={`
                    rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                    ${
                      selected
                        ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                    }
                  `}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recurring toggle */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Recurring job?
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Will you need this service on an ongoing basis (e.g., weekly plowing)?
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={isRecurring}
              onClick={() => setIsRecurring(!isRecurring)}
              className={`
                relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                ${isRecurring ? "bg-orange-600" : "bg-stone-300 dark:bg-stone-600"}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow
                  transition-transform duration-200
                  ${isRecurring ? "translate-x-7" : "translate-x-1"}
                `}
              />
            </button>
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {isRecurring ? "Yes, recurring" : "No, one-time"}
            </span>
          </div>
        </div>

        {/* Plowing-specific questions */}
        {showPlowing && (
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Plowing details
            </h2>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Property address *
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
            <div>
              <label htmlFor="drivewayLengthFt" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Driveway length (approx.)
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="drivewayLengthFt"
                  type="number"
                  min="1"
                  max="500"
                  step="1"
                  value={drivewayLengthFt}
                  onChange={(e) => setDrivewayLengthFt(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-24 rounded-xl border border-stone-300 bg-white px-4 py-2.5 dark:border-stone-600 dark:bg-stone-800"
                />
                <span className="text-sm text-stone-500 dark:text-stone-400">feet</span>
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Helps drivers give you a better estimate
              </p>
            </div>
          </div>
        )}

        {/* Description & photos */}
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Additional details
          </h2>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what you need—items to move, special instructions, etc."
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Photos (optional, max {MAX_PHOTOS})
            </label>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              Add photos so drivers know what to expect.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {photoUrls.map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt={`Item ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photoUrls.length < MAX_PHOTOS && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-orange-400 hover:bg-orange-50/50 dark:border-stone-600 dark:bg-stone-800 dark:hover:border-orange-500">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="text-xs text-stone-500">Uploading…</span>
                  ) : (
                    <>
                      <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="mt-1 text-xs text-stone-500">Add</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Delivery-specific questions */}
        {showDelivery && (
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Pickup & delivery
            </h2>
            <div>
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Point A (pickup) *
              </label>
              <input
                id="pickupAddress"
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Where should we pick up?"
                className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
            <div>
              <label htmlFor="dropoffAddress" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Point B (dropoff)
              </label>
              <input
                id="dropoffAddress"
                type="text"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Where should we deliver? (optional for junk removal)"
                className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
          >
            ← Back to home
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-orange-600 px-8 py-3 font-semibold text-white shadow-md shadow-orange-600/25 transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Find truck owners →
          </button>
        </div>
      </form>
    </div>
  );
}
