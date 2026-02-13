/** biome-ignore-all lint/correctness/useUniqueElementIds: unnecessary for hardcoded lines */
import { useAtomValue } from "jotai";
import { tracksAtom } from "@/atoms/event/tracks";
import { challengesAtom } from "@/atoms/event/challenges";
import { teamRegistrationEnabledAtom } from "@/atoms/event/teamRegistration";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Clock } from "lucide-react";
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
	const registrationEnabled = useAtomValue(teamRegistrationEnabledAtom);

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

	return registrationEnabled ? (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					size="lg"
					className="mt-2 w-full sm:w-auto shadow-[0_0_15px_var(--tw-shadow-color)] shadow-primary/40"
				>
					<ArrowRight className="mr-2 h-4 w-4" /> Register Your Team
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] max-h-[85vh] p-0 overflow-hidden">
				<ScrollArea className="max-h-[85vh]">
					<div className="p-6 grid gap-4">
						<DialogHeader>
							<DialogTitle>Register Team</DialogTitle>
							<DialogDescription>
								Only one member of your team needs to fill out this form. View
								full track and challenge information in the Resources section.
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
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	) : (
		<Button
			size="lg"
			variant="outline"
			disabled
			className="mt-2 w-full sm:w-auto"
		>
			<Clock className="mr-2 h-4 w-4" /> Team registration will open soon. Stay
			tuned!
		</Button>
	);
}
