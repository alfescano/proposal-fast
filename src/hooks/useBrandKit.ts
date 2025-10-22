import { useBrandKit as useContext } from "@/contexts/BrandKitContext";

export function useBrandKit() {
  return useContext();
}
