export type Money = {
  currency: "DZD";
  amount: number;
};

export type Language = "fr" | "ar" | "fr_ar";

export type UserRole = "passenger" | "driver" | "admin";

export type User = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  language: Language;
};

export type TripMode = "carpool" | "bus" | "train";

export type CarpoolTrip = {
  id: string;
  mode: "carpool";
  coverImageUrl?: string;
  fromLabel: string;
  toLabel: string;
  pickupLabel: string;
  dropoffLabel: string;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  dateLabel: string;
  pricePerSeat: Money;
  seatsLeft: number;
  driverName: string;
  driverRating: number;
  vehicleLabel: string;
  luggageIncluded: boolean;
  instantBooking: boolean;
  womenOnly: boolean;
};

export type BusDeparture = {
  id: string;
  mode: "bus";
  providerName: string;
  coverImageUrl?: string;
  serviceClass: "Economy" | "Comfort" | "Premium";
  fromLabel: string;
  toLabel: string;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  dateLabel: string;
  baseFare: Money;
  serviceFee: Money;
  availableSeats: number;
  instantConfirmation: boolean;
};

export type TrainDeparture = {
  id: string;
  mode: "train";
  providerName: string;
  coverImageUrl?: string;
  serviceClass: "Standard" | "First";
  fromLabel: string;
  toLabel: string;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  dateLabel: string;
  baseFare: Money;
  serviceFee: Money;
  availableSeats: number;
  instantConfirmation: boolean;
};

export type SearchResult = CarpoolTrip | BusDeparture | TrainDeparture;

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "awaiting_approval"
  | "cancelled"
  | "completed";

export type PaymentMethod = "cash" | "edahabia" | "cib" | "bank_transfer";

export type PaymentStatus =
  | "not_required"
  | "pending"
  | "captured"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type Booking = {
  id: string;
  /** Trip id from API — matches checkout session keys when booking was created from a trip. */
  tripId?: string;
  mode: TripMode;
  status: BookingStatus;
  fromLabel: string;
  toLabel: string;
  dateLabel: string;
  departureTime: string;
  arrivalTime?: string;
  seatLabel?: string;
  seatsCount: number;
  totalPrice: Money;
  referenceCode: string;
  providerOrDriverName: string;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
  };
  /** Checkout UI (mock / future API) */
  baseFare?: Money;
  serviceFee?: Money;
  originDetail?: string;
  destinationDetail?: string;
  pickupDetail?: string;
  dropoffDetail?: string;
  durationLabel?: string;
  vehicleLabel?: string;
  serviceClass?: string;
  boardingPointTitle?: string;
  boardingPointBody?: string;
  /** Link for “back to trip” during checkout demo */
  contextBackHref?: string;
};

export type Review = {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAtLabel: string;
  authorName: string;
};
