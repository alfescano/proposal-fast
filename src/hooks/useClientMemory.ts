import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ClientPreference {
  id: string;
  client_name: string;
  tone?: string;
  industry?: string;
  preferred_style?: string;
  key_terms?: string[];
  contract_count: number;
  updated_at: string;
}

export function useClientMemory(clientName: string, userId?: string) {
  const [preference, setPreference] = useState<ClientPreference | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientName || !userId) {
      setPreference(null);
      return;
    }

    loadClientPreference();
  }, [clientName, userId]);

  const loadClientPreference = async () => {
    if (!userId || !clientName) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("client_preferences")
        .select("*")
        .eq("user_id", userId)
        .eq("client_name", clientName)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading client preference:", error);
        setPreference(null);
      } else if (data) {
        setPreference(data as ClientPreference);
      } else {
        setPreference(null);
      }
    } catch (error) {
      console.error("Error fetching client memory:", error);
      setPreference(null);
    } finally {
      setLoading(false);
    }
  };

  return { preference, loading };
}