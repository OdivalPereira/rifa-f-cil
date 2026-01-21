import { useUserLocation } from "@/hooks/useRaffle";

export const LocationPrefetcher = () => {
  useUserLocation();
  return null;
};
