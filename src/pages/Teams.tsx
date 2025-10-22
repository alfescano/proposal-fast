import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createTeam, getTeams, removeTeamMember, getTeamMembers, inviteTeamMember } from "@/lib/teamService";

interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  email: string;
  role: "owner" | "admin" | "member";
  accepted_at: string | null;
  invited_at: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    try {
      await createTeam(newTeamName);
      setNewTeamName("");
      setCreateDialogOpen(false);
      await loadTeams();
      toast.success("Team created!");
    } catch (error) {
      toast.error("Failed to create team");
    }
  };

  const handleSelectTeam = async (team: Team) => {
    setSelectedTeam(team);
    try {
      const members = await getTeamMembers(team.id);
      setTeamMembers(members);
    } catch (error) {
      toast.error("Failed to load team members");
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedTeam) {
      toast.error("Email is required");
      return;
    }
    setInviteLoading(true);
    try {
      await inviteTeamMember(selectedTeam.id, inviteEmail);
      const members = await getTeamMembers(selectedTeam.id);
      setTeamMembers(members);
      setInviteEmail("");
      toast.success("Invite sent!");
    } catch (error) {
      toast.error("Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeTeamMember(memberId);
      if (selectedTeam) {
        const members = await getTeamMembers(selectedTeam.id);
        setTeamMembers(members);
      }
      toast.success("Member removed");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8 pt-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Teams</h1>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={handleCreateTeam} className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading teams...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Teams List */}
            <div className="md:col-span-1">
              <Card className="bg-slate-800/50 border-slate-700/50 divide-y divide-slate-700">
                {teams.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No teams yet. Create one to get started!
                  </div>
                ) : (
                  teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleSelectTeam(team)}
                      className={`w-full text-left p-4 hover:bg-slate-700/50 transition ${
                        selectedTeam?.id === team.id ? "bg-slate-700" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <p className="font-semibold">{team.name}</p>
                      </div>
                      <p className="text-xs text-slate-400">{team.slug}</p>
                    </button>
                  ))
                )}
              </Card>
            </div>

            {/* Team Members */}
            {selectedTeam && (
              <div className="md:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">{selectedTeam.name} Members</h2>
                    <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Email address"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                          <Button
                            onClick={handleInviteMember}
                            disabled={inviteLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {inviteLoading ? "Inviting..." : "Send Invite"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{member.email}</p>
                          <p className="text-xs text-slate-400">
                            {member.role} • {member.accepted_at ? "Accepted" : "Pending"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 hover:bg-red-600/20 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
