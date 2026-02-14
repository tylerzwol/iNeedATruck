export const VEHICLE_TYPES = [
  { value: "pickup", label: "Pickup truck" },
  { value: "pickup_trailer", label: "Pickup + trailer" },
  { value: "flatbed", label: "Flatbed" },
  { value: "box_truck", label: "Box truck" },
  { value: "dump_truck", label: "Dump truck" },
] as const;

export const SERVICE_TYPES = [
  { value: "pickup_delivery", label: "Pickup & delivery" },
  { value: "junk_removal", label: "Junk removal" },
  { value: "small_moves", label: "Small moves" },
  { value: "appliance_transport", label: "Appliance transport" },
  { value: "furniture_transport", label: "Furniture transport" },
  { value: "mulch_delivery", label: "Mulch delivery" },
  { value: "yard_waste_haul", label: "Yard waste haul" },
  { value: "snow_plowing", label: "Snow plowing" },
  { value: "salt_spreading", label: "Salt spreading" },
  { value: "snow_haul", label: "Snow haul" },
  { value: "firewood_delivery", label: "Firewood delivery" },
  { value: "leaf_cleanup_haul", label: "Leaf cleanup & haul" },
] as const;

export const SEASONAL_TAGS = [
  { value: "all", label: "All year" },
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
] as const;

export const SEASONS = [
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
] as const;

/** SessionStorage key for job request data from get-started page */
export const JOB_REQUEST_STORAGE_KEY = "iNeedATruck_jobRequest";

/** Job request shape stored after get-started form (for Find page & Request Job to read) */
export type JobRequestData = {
  services: string[];
  isRecurring: boolean;
  address?: string;
  drivewayLengthFt?: number;
  pickupAddress?: string;
  dropoffAddress?: string;
  description?: string;
  photoUrls?: string[];
};
