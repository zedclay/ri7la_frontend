import { Suspense } from "react";
import { PassengerProfileClient } from "./passenger-profile-client";

export default function PassengerProfilePage() {
  return (
    <Suspense>
      <PassengerProfileClient />
    </Suspense>
  );
}
