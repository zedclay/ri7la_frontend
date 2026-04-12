/** Must match backend CARPOOL_AMENITY_WHITELIST in trips.service.ts */
export const CARPOOL_AMENITY_IDS = [
  "AIR_CONDITIONING",
  "COMFORTABLE_SEATS",
  "USB_CHARGING",
  "WIFI",
  "LARGE_TRUNK",
  "EXTRA_LEGROOM",
] as const;

export type CarpoolAmenityId = (typeof CARPOOL_AMENITY_IDS)[number];

export function carpoolAmenityIcon(id: CarpoolAmenityId): string {
  switch (id) {
    case "AIR_CONDITIONING":
      return "ac_unit";
    case "COMFORTABLE_SEATS":
      return "airline_seat_recline_normal";
    case "USB_CHARGING":
      return "usb";
    case "WIFI":
      return "wifi";
    case "LARGE_TRUNK":
      return "luggage";
    case "EXTRA_LEGROOM":
      return "straighten";
    default:
      return "check_circle";
  }
}
