import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getBrandKit, type BrandKit } from "@/lib/brandKitService";

interface BrandKitContextType {
  brandKit: BrandKit | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BrandKitContext = createContext<BrandKitContextType | undefined>(undefined);

export function BrandKitProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrandKit = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const kit = await getBrandKit(userId);
      setBrandKit(kit);
    } catch (error) {
      console.error("Failed to load brand kit:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandKit();
  }, [userId]);

  return (
    <BrandKitContext.Provider value={{ brandKit, loading, refetch: fetchBrandKit }}>
      {children}
    </BrandKitContext.Provider>
  );
}

export function useBrandKit() {
  const context = useContext(BrandKitContext);
  if (!context) {
    throw new Error("useBrandKit must be used within BrandKitProvider");
  }
  return context;
}
