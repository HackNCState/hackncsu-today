/** biome-ignore-all lint/correctness/useUniqueElementIds: unnecessary for hardcoded lines */
import { useAtomValue } from "jotai";
import { tracksAtom } from "@/atoms/event/tracks";
import { challengesAtom } from "@/atoms/event/challenges";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { functionsService } from "@/services/functions.service";
import {
	PartialParticipantSchema,
	type PartialParticipant,
} from "@/types/user";
import { userAtom } from "@/atoms/user";
import TeamForm, { type TeamFormSubmitPayload } from "@/components/TeamForm";

export default function UnregisteredView() {
	const tracks = useAtomValue(tracksAtom);
	const challenges = useAtomValue(challengesAtom);
	const user = useAtomValue(userAtom);

	const initialMembers: PartialParticipant[] = user
		? [PartialParticipantSchema.parse(user)]
		: [];

	const handleSubmit = async (payload: TeamFormSubmitPayload) => {
		await functionsService.registerTeam({
			name: payload.name,
			track: payload.track,
			mentoringHelp: payload.mentoringHelp,
			members: payload.memberIds,
			challenges: payload.challenges,
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="lg" className="mt-2 w-full sm:w-auto">
					<ArrowRight className="mr-2 h-4 w-4" /> Register Your Team
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Register Team</DialogTitle>
					<DialogDescription>
						Only one member of your team needs to fill out this form.
					</DialogDescription>
				</DialogHeader>

				<TeamForm
					tracks={tracks}
					challenges={challenges}
					initialValues={{
						name: "",
						track: "",
						mentoringHelp: "",
						challenges: [],
						members: initialMembers,
					}}
					lockedMemberIds={user?.id ? [user.id] : []}
					currentUserId={user?.id}
					currentUserLabel={user?.username}
					submitLabel="Submit Registration"
					onSubmit={handleSubmit}
				/>
			</DialogContent>
		</Dialog>
	);
}
