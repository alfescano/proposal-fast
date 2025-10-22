import { BookKickoffMeeting, BookKickoffMeetingAdmin } from "@/components/BookKickoffMeeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProposalActionsProps {
  clientName?: string;
  clientEmail?: string;
  proposalTitle?: string;
}

/**
 * Component to display available actions on a proposal
 * Includes booking kickoff meeting button if calendar is configured
 */
export function ProposalActions({
  clientName,
  clientEmail,
  proposalTitle,
}: ProposalActionsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BookKickoffMeetingAdmin />
          
          <div className="flex flex-col gap-2 pt-2">
            <BookKickoffMeeting
              clientName={clientName}
              clientEmail={clientEmail}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
