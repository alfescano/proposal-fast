import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase, type UserProfile } from "@/lib/supabase";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: "owner" | "team_member" | "client" | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUserToSupabase = async () => {
      try {
        if (!clerkUser) {
          setUserProfile(null);
          return;
        }

        if (!supabase) {
          // Fallback: create minimal profile without Supabase
          setUserProfile({
            id: clerkUser.id,
            auth_id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name: clerkUser.firstName
              ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`
              : "User",
            avatar: clerkUser.imageUrl || null,
            role: "owner",
            account_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserProfile);
          return;
        }

        const { data: existing } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("auth_id", clerkUser.id)
          .single()
          .catch(() => ({ data: null }));

        if (existing) {
          setUserProfile(existing);
        } else {
          const newProfile: Partial<UserProfile> = {
            auth_id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name: clerkUser.firstName
              ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`
              : "User",
            avatar: clerkUser.imageUrl,
            role: "owner",
            created_at: new Date().toISOString(),
          };

          await supabase
            .from("user_profiles")
            .insert([newProfile])
            .catch(() => {});

          setUserProfile({
            id: clerkUser.id,
            auth_id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name: clerkUser.firstName
              ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`
              : "User",
            avatar: clerkUser.imageUrl || null,
            role: "owner",
            account_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserProfile);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setError("Failed to sync auth");
      }
    };

    syncUserToSupabase();
  }, [clerkUser]);

  const value: AuthContextType = {
    user: userProfile,
    loading,
    isAuthenticated: !!clerkUser,
    userRole: userProfile?.role || null,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
