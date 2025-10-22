import { supabase } from "@/lib/supabase";

export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  email: string;
  role: "owner" | "admin" | "member";
  accepted_at: string | null;
  invited_at: string;
}

export async function createTeam(name: string): Promise<Team> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user?.id) throw new Error("Not authenticated");

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const randomId = Math.random().toString(36).slice(2, 10);

  const { data, error } = await supabase.from("teams").insert({
    owner_id: session.session.user.id,
    name,
    slug: `${slug}-${randomId}`,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: "admin" | "member" = "member"
): Promise<TeamMember> {
  const { data, error } = await supabase.from("team_members").insert({
    team_id: teamId,
    email,
    role,
    user_id: null, // Will be set when user accepts
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .order("invited_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateTeamMemberRole(
  memberId: string,
  role: "admin" | "member"
): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .update({ role })
    .eq("id", memberId);

  if (error) throw error;
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId);

  if (error) throw error;
}

export async function shareContractWithTeam(
  contractId: string,
  teamId: string
): Promise<void> {
  const { error } = await supabase
    .from("contracts")
    .update({
      team_id: teamId,
      shared_with_team: true,
    })
    .eq("id", contractId);

  if (error) throw error;
}

export async function getTeamContracts(teamId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("team_id", teamId)
    .eq("shared_with_team", true);

  if (error) throw error;
  return data || [];
}