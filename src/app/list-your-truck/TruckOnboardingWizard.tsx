"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  VEHICLE_TYPES,
  SERVICE_TYPES,
  SEASONAL_TAGS,
  SEASONS,
} from "@/lib/constants";

const STEPS = [
  { id: 1, title: "Identity & trust", short: "You" },
  { id: 2, title: "Vehicle", short: "Truck" },
  { id: 3, title: "Services", short: "Services" },
  { id: 4, title: "Pricing", short: "Pricing" },
  { id: 5, title: "Availability", short: "Schedule" },
];

type FormData = {
  // Step 1
  email: string;
  fullName: string;
  phoneNumber: string;
  profilePhotoUrl: string;
  driverLicenseFrontUrl: string;
  driverLicenseBackUrl: string;
  insuranceFrontUrl: string;
  insuranceBackUrl: string;
  serviceRadiusMiles: number | "";
  zipCodes: string;
  bio: string;
  driverLicenseVerified: boolean;
  insuranceConfirmed: boolean;
  backgroundCheckConsent: boolean;
  // Step 2
  vehicleType: string;
  bedLengthFt: number | "";
  payloadCapacityLbs: number | "";
  towingCapable: boolean;
  towCapacityLbs: number | "";
  awdOr4wd: boolean;
  hitchType: string;
  trailerSizeFt: number | "";
  trailerCapacityLbs: number | "";
  hasRamps: boolean;
  hasDolly: boolean;
  hasStraps: boolean;
  hasMovingBlankets: boolean;
  hasPlow: boolean;
  // Step 3
  serviceTypes: Record<string, { enabled: boolean; seasonalTag: string }>;
  // Step 4
  hourlyRate: number | "";
  minimumJobPrice: number | "";
  perMileRate: number | "";
  emergencySurchargeEnabled: boolean;
  // Step 5
  dailyHours: Record<string, { start: string; end: string } | null>;
  seasonalAvailability: string[];
  acceptsSameDayJobs: boolean;
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const defaultServiceTypes = Object.fromEntries(
  SERVICE_TYPES.map((s) => [s.value, { enabled: false, seasonalTag: "all" }])
);

const initialData: FormData = {
  email: "",
  fullName: "",
  phoneNumber: "",
  profilePhotoUrl: "",
  driverLicenseFrontUrl: "",
  driverLicenseBackUrl: "",
  insuranceFrontUrl: "",
  insuranceBackUrl: "",
  serviceRadiusMiles: "",
  zipCodes: "",
  bio: "",
  driverLicenseVerified: false,
  insuranceConfirmed: false,
  backgroundCheckConsent: false,
  vehicleType: "pickup",
  bedLengthFt: "",
  payloadCapacityLbs: "",
  towingCapable: false,
  towCapacityLbs: "",
  awdOr4wd: false,
  hitchType: "",
  trailerSizeFt: "",
  trailerCapacityLbs: "",
  hasRamps: false,
  hasDolly: false,
  hasStraps: false,
  hasMovingBlankets: false,
  hasPlow: false,
  serviceTypes: defaultServiceTypes,
  hourlyRate: "",
  minimumJobPrice: "",
  perMileRate: "",
  emergencySurchargeEnabled: false,
  dailyHours: Object.fromEntries(DAYS.map((d) => [d, null])),
  seasonalAvailability: ["winter", "spring", "summer", "fall"],
  acceptsSameDayJobs: true,
};

export function TruckOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
      return;
    }

    // Required confirmations (step 1)
    if (!data.driverLicenseVerified || !data.insuranceConfirmed || !data.backgroundCheckConsent) {
      setError("Please confirm your driver license, insurance, and background check consent before submitting.");
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const serviceOfferings = Object.entries(data.serviceTypes)
        .filter(([, v]) => v.enabled)
        .map(([serviceType, v]) => ({ serviceType, seasonalTag: v.seasonalTag }));

      const res = await fetch("/api/truck-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          profilePhotoUrl: data.profilePhotoUrl || undefined,
          driverLicenseFrontUrl: data.driverLicenseFrontUrl || undefined,
          driverLicenseBackUrl: data.driverLicenseBackUrl || undefined,
          insuranceFrontUrl: data.insuranceFrontUrl || undefined,
          insuranceBackUrl: data.insuranceBackUrl || undefined,
          serviceRadiusMiles: data.serviceRadiusMiles || undefined,
          zipCodes: data.zipCodes ? data.zipCodes.split(/,\s*/).filter(Boolean) : [],
          bio: data.bio || undefined,
          driverLicenseVerified: data.driverLicenseVerified,
          insuranceConfirmed: data.insuranceConfirmed,
          backgroundCheckConsent: data.backgroundCheckConsent,
          vehicle: {
            vehicleType: data.vehicleType,
            bedLengthFt: Number(data.bedLengthFt),
            payloadCapacityLbs: Number(data.payloadCapacityLbs),
            towingCapable: data.towingCapable,
            towCapacityLbs: data.towCapacityLbs ? Number(data.towCapacityLbs) : undefined,
            awdOr4wd: data.awdOr4wd,
            hitchType: data.hitchType || undefined,
            trailerSizeFt: data.trailerSizeFt ? Number(data.trailerSizeFt) : undefined,
            trailerCapacityLbs: data.trailerCapacityLbs ? Number(data.trailerCapacityLbs) : undefined,
            hasRamps: data.hasRamps,
            hasDolly: data.hasDolly,
            hasStraps: data.hasStraps,
            hasMovingBlankets: data.hasMovingBlankets,
            hasPlow: data.hasPlow,
          },
          serviceOfferings,
          pricing: {
            hourlyRate: Number(data.hourlyRate),
            minimumJobPrice: Number(data.minimumJobPrice),
            perMileRate: data.perMileRate ? Number(data.perMileRate) : undefined,
            emergencySurchargeEnabled: data.emergencySurchargeEnabled,
          },
          availability: {
            dailyHours: data.dailyHours,
            seasonalAvailability: data.seasonalAvailability,
            acceptsSameDayJobs: data.acceptsSameDayJobs,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Failed to submit");
        return;
      }
      router.push("/list-your-truck/success");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const update = (updates: Partial<FormData>) => setData((d) => ({ ...d, ...updates }));

  const [uploading, setUploading] = useState<string | null>(null);

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "profilePhotoUrl" | "driverLicenseFrontUrl" | "driverLicenseBackUrl" | "insuranceFrontUrl" | "insuranceBackUrl"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.url) {
        update({ [field]: json.url });
      }
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex flex-1 flex-col items-center rounded-lg px-2 py-2 text-center transition-colors ${
                step >= s.id ? "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200" : "bg-stone-100 text-stone-500 dark:bg-stone-800/50"
              }`}
            >
              <span className="text-xs font-medium">{s.short}</span>
              <span className="mt-0.5 hidden text-[10px] sm:block">{s.title}</span>
            </button>
            {i < STEPS.length - 1 && <div className="h-0.5 w-2 flex-shrink-0 bg-stone-200 dark:bg-stone-700" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Step 1: Identity & Trust */}
      {step === 1 && (
        <div className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Identity & trust</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Full name *</label>
            <input
              type="text"
              required
              value={data.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Email *</label>
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Phone number *</label>
            <input
              type="tel"
              required
              value={data.phoneNumber}
              onChange={(e) => update({ phoneNumber: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Profile photo</label>
            <div className="mt-1 flex items-center gap-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-6 py-4 transition-colors hover:border-orange-400 hover:bg-orange-50/50 dark:border-stone-600 dark:bg-stone-800 dark:hover:border-orange-500">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "profilePhotoUrl")}
                  disabled={!!uploading}
                />
                {uploading === "profilePhotoUrl" ? (
                  <span className="text-sm text-stone-500">Uploading…</span>
                ) : data.profilePhotoUrl ? (
                  <>
                    <img src={data.profilePhotoUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                    <span className="mt-2 text-xs text-stone-500">Tap to change</span>
                  </>
                ) : (
                  <>
                    <svg className="h-10 w-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="mt-2 text-sm text-stone-600 dark:text-stone-400">Choose from library or camera</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Service radius (miles)</label>
              <input
                type="number"
                min="1"
                max="200"
                placeholder="25"
                value={data.serviceRadiusMiles}
                onChange={(e) => update({ serviceRadiusMiles: e.target.value ? Number(e.target.value) : "" })}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Or zip codes (comma-separated)</label>
              <input
                type="text"
                placeholder="12345, 12346"
                value={data.zipCodes}
                onChange={(e) => update({ zipCodes: e.target.value })}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Short bio</label>
            <textarea
              rows={3}
              placeholder="Tell customers about yourself..."
              value={data.bio}
              onChange={(e) => update({ bio: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Driver license</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 transition-colors hover:border-orange-400 hover:bg-orange-50/50 dark:border-stone-600 dark:bg-stone-800 dark:hover:border-orange-500">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "driverLicenseFrontUrl")}
                  disabled={!!uploading}
                />
                {uploading === "driverLicenseFrontUrl" ? (
                  <span className="text-sm text-stone-500">Uploading…</span>
                ) : data.driverLicenseFrontUrl ? (
                  <>
                    <img src={data.driverLicenseFrontUrl} alt="License front" className="h-16 w-full rounded object-cover" />
                    <span className="mt-2 text-xs text-stone-500">Front • Tap to change</span>
                  </>
                ) : (
                  <>
                    <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                    <span className="mt-2 text-xs text-stone-600 dark:text-stone-400">Front</span>
                  </>
                )}
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 transition-colors hover:border-orange-400 hover:bg-orange-50/50 dark:border-stone-600 dark:bg-stone-800 dark:hover:border-orange-500">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "driverLicenseBackUrl")}
                  disabled={!!uploading}
                />
                {uploading === "driverLicenseBackUrl" ? (
                  <span className="text-sm text-stone-500">Uploading…</span>
                ) : data.driverLicenseBackUrl ? (
                  <>
                    <img src={data.driverLicenseBackUrl} alt="License back" className="h-16 w-full rounded object-cover" />
                    <span className="mt-2 text-xs text-stone-500">Back • Tap to change</span>
                  </>
                ) : (
                  <>
                    <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                    <span className="mt-2 text-xs text-stone-600 dark:text-stone-400">Back</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Insurance card</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 transition-colors hover:border-orange-400 hover:bg-orange-50/50 dark:border-stone-600 dark:bg-stone-800 dark:hover:border-orange-500">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "insuranceFrontUrl")}
                  disabled={!!uploading}
                />
                {uploading === "insuranceFrontUrl" ? (
                  <span className="text-sm text-stone-500">Uploading…</span>
                ) : data.insuranceFrontUrl ? (
                  <>
                    <img src={data.insuranceFrontUrl} alt="Insurance front" className="h-16 w-full rounded object-cover" />
                    <span className="mt-2 text-xs text-stone-500">Front • Tap to change</span>
                  </>
                ) : (
                  <>
                    <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                    <span className="mt-2 text-xs text-stone-600 dark:text-stone-400">Front</span>
                  </>
                )}
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 transition-colors hover:border-orange-400 hover:bg-orange-50/50 dark:border-stone-600 dark:bg-stone-800 dark:hover:border-orange-500">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "insuranceBackUrl")}
                  disabled={!!uploading}
                />
                {uploading === "insuranceBackUrl" ? (
                  <span className="text-sm text-stone-500">Uploading…</span>
                ) : data.insuranceBackUrl ? (
                  <>
                    <img src={data.insuranceBackUrl} alt="Insurance back" className="h-16 w-full rounded object-cover" />
                    <span className="mt-2 text-xs text-stone-500">Back • Tap to change</span>
                  </>
                ) : (
                  <>
                    <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                    <span className="mt-2 text-xs text-stone-600 dark:text-stone-400">Back</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Confirmations <span className="text-red-500">*</span></label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.driverLicenseVerified}
                  onChange={(e) => update({ driverLicenseVerified: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-orange-600"
                />
                <span className="text-sm">I confirm my driver license is valid and accurate <span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.insuranceConfirmed}
                  onChange={(e) => update({ insuranceConfirmed: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-orange-600"
                />
                <span className="text-sm">I confirm my insurance is current and accurate <span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.backgroundCheckConsent}
                  onChange={(e) => update({ backgroundCheckConsent: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-orange-600"
                />
                <span className="text-sm">Background check consent <span className="text-red-500">*</span></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Vehicle */}
      {step === 2 && (
        <div className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Vehicle information</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Vehicle type *</label>
            <select
              value={data.vehicleType}
              onChange={(e) => update({ vehicleType: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Bed length (ft) *</label>
              <input
                type="number"
                min="1"
                max="30"
                step="0.5"
                required
                value={data.bedLengthFt}
                onChange={(e) => update({ bedLengthFt: e.target.value ? Number(e.target.value) : "" })}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Payload capacity (lbs) *</label>
              <input
                type="number"
                min="500"
                max="50000"
                required
                value={data.payloadCapacityLbs}
                onChange={(e) => update({ payloadCapacityLbs: e.target.value ? Number(e.target.value) : "" })}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.towingCapable} onChange={(e) => update({ towingCapable: e.target.checked })} className="h-4 w-4 rounded text-orange-600" />
              <span className="text-sm">Towing capable</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.awdOr4wd} onChange={(e) => update({ awdOr4wd: e.target.checked })} className="h-4 w-4 rounded text-orange-600" />
              <span className="text-sm">AWD / 4WD</span>
            </label>
          </div>
          {data.towingCapable && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Hitch type *</label>
                <input
                  type="text"
                  placeholder="e.g. 2-inch ball, gooseneck, fifth wheel"
                  required
                  value={data.hitchType}
                  onChange={(e) => update({ hitchType: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Tow capacity (lbs) *</label>
                <input
                  type="number"
                  min="1000"
                  max="35000"
                  placeholder="e.g. 10000"
                  required
                  value={data.towCapacityLbs}
                  onChange={(e) => update({ towCapacityLbs: e.target.value ? Number(e.target.value) : "" })}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
                />
              </div>
            </>
          )}
          {data.vehicleType === "pickup_trailer" && (
            <div className="space-y-4 rounded-lg border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-800 dark:bg-orange-950/30">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Trailer details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Trailer size (ft) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    placeholder="e.g. 16"
                    required
                    value={data.trailerSizeFt}
                    onChange={(e) => update({ trailerSizeFt: e.target.value ? Number(e.target.value) : "" })}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Trailer max capacity (lbs) *</label>
                  <input
                    type="number"
                    min="500"
                    max="30000"
                    placeholder="e.g. 7000"
                    required
                    value={data.trailerCapacityLbs}
                    onChange={(e) => update({ trailerCapacityLbs: e.target.value ? Number(e.target.value) : "" })}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
                  />
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Equipment</label>
            <div className="mt-2 flex flex-wrap gap-4">
              {[
                { key: "hasRamps" as const, label: "Ramps" },
                { key: "hasDolly" as const, label: "Dolly" },
                { key: "hasStraps" as const, label: "Straps" },
                { key: "hasMovingBlankets" as const, label: "Moving blankets" },
                { key: "hasPlow" as const, label: "Plow" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data[key]}
                    onChange={(e) => update({ [key]: e.target.checked })}
                    className="h-4 w-4 rounded text-orange-600"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Services */}
      {step === 3 && (
        <div className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Service offerings</h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">Select which services you provide. Add seasonal tag for seasonal work.</p>
          <div className="space-y-3">
            {SERVICE_TYPES.map((s) => (
              <div key={s.value} className="flex flex-wrap items-center gap-4 rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.serviceTypes[s.value]?.enabled ?? false}
                    onChange={(e) =>
                      update({
                        serviceTypes: {
                          ...data.serviceTypes,
                          [s.value]: { ...data.serviceTypes[s.value], enabled: e.target.checked },
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-orange-600"
                  />
                  <span className="font-medium">{s.label}</span>
                </label>
                {data.serviceTypes[s.value]?.enabled && (
                  <select
                    value={data.serviceTypes[s.value]?.seasonalTag ?? "all"}
                    onChange={(e) =>
                      update({
                        serviceTypes: {
                          ...data.serviceTypes,
                          [s.value]: { ...data.serviceTypes[s.value], seasonalTag: e.target.value },
                        },
                      })
                    }
                    className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-800"
                  >
                    {SEASONAL_TAGS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Pricing */}
      {step === 4 && (
        <div className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Pricing preferences</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Hourly rate ($) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={data.hourlyRate}
              onChange={(e) => update({ hourlyRate: e.target.value ? Number(e.target.value) : "" })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Minimum job price ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={data.minimumJobPrice}
              onChange={(e) => update({ minimumJobPrice: e.target.value ? Number(e.target.value) : "" })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Per-mile rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              value={data.perMileRate}
              onChange={(e) => update({ perMileRate: e.target.value ? Number(e.target.value) : "" })}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <label className="group relative flex cursor-help items-center gap-2">
            <input
              type="checkbox"
              checked={data.emergencySurchargeEnabled}
              onChange={(e) => update({ emergencySurchargeEnabled: e.target.checked })}
              className="h-4 w-4 rounded text-orange-600"
            />
            <span className="text-sm">Emergency surcharge enabled</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-stone-200 text-xs text-stone-600 transition-colors group-hover:bg-orange-200 dark:bg-stone-600 dark:text-stone-400 dark:group-hover:bg-orange-900/50">
              ?
            </span>
            <span className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden max-w-xs rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block dark:bg-stone-100 dark:text-stone-900">
              Charge an extra fee for same-day or rush jobs that require immediate availability
            </span>
          </label>
        </div>
      )}

      {/* Step 5: Availability */}
      {step === 5 && (
        <div className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Availability</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Hours by day</label>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Set your availability for each day. Leave closed for days you don&apos;t work.</p>
            <div className="mt-2 space-y-2">
              {DAYS.map((day) => (
                <div key={day} className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                  <span className="w-24 font-medium text-stone-700 dark:text-stone-300">{DAY_LABELS[day]}</span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={data.dailyHours[day] !== null}
                      onChange={(e) => {
                        const next = { ...data.dailyHours };
                        next[day] = e.target.checked ? { start: "09:00", end: "17:00" } : null;
                        update({ dailyHours: next });
                      }}
                      className="h-4 w-4 rounded text-orange-600"
                    />
                    <span className="text-sm">Available</span>
                  </label>
                  {data.dailyHours[day] !== null && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={data.dailyHours[day]?.start ?? "09:00"}
                        onChange={(e) => {
                          const next = { ...data.dailyHours };
                          next[day] = { start: e.target.value, end: next[day]?.end ?? "17:00" };
                          update({ dailyHours: next });
                        }}
                        className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800"
                      />
                      <span className="text-stone-400">to</span>
                      <input
                        type="time"
                        value={data.dailyHours[day]?.end ?? "17:00"}
                        onChange={(e) => {
                          const next = { ...data.dailyHours };
                          next[day] = { start: next[day]?.start ?? "09:00", end: e.target.value };
                          update({ dailyHours: next });
                        }}
                        className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Seasons you work</label>
            <div className="mt-2 flex flex-wrap gap-4">
              {SEASONS.map((s) => (
                <label key={s.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.seasonalAvailability.includes(s.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...data.seasonalAvailability, s.value]
                        : data.seasonalAvailability.filter((x) => x !== s.value);
                      update({ seasonalAvailability: next });
                    }}
                    className="h-4 w-4 rounded text-orange-600"
                  />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.acceptsSameDayJobs}
              onChange={(e) => update({ acceptsSameDayJobs: e.target.checked })}
              className="h-4 w-4 rounded text-orange-600"
            />
            <span className="text-sm">Accepts same-day jobs</span>
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="rounded-xl border border-stone-300 px-6 py-2 font-semibold disabled:opacity-40 dark:border-stone-600"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Submitting…" : step === 5 ? "List my truck" : "Next"}
        </button>
      </div>
    </form>
  );
}
