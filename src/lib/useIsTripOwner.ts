"use client";

import { apiGetJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { useEffect, useState } from "react";

export type TripOwnerCheck = "pending" | boolean;

/**
 * Whether the logged-in user owns this trip. `pending` while checking; `false` if logged out or not owner.
 */
export function useIsTripOwner(tripOwnerUserId: string | null | undefined): TripOwnerCheck {
  const [state, setState] = useState<TripOwnerCheck>(() => (tripOwnerUserId ? "pending" : false));

  useEffect(() => {
    if (!tripOwnerUserId) {
      setState(false);
      return;
    }
    if (!getAccessToken()) {
      setState(false);
      return;
    }
    let cancelled = false;
    void apiGetJsonData<{ id: string }>("/api/users/me")
      .then((me) => {
        if (!cancelled) setState(me.id === tripOwnerUserId);
      })
      .catch(() => {
        if (!cancelled) setState(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tripOwnerUserId]);

  return state;
}
