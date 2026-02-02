import { useAtomValue } from "jotai";
import { isOrganizerAtom } from "@/atoms/user";
import { ScrollArea } from "@/components/ui/scroll-area";
import OrganizerView from "./OrganizerView";
import TeamView from "./TeamView";
import AnnouncementsView from "./AnnouncementsView";
import ResumeUploadView from "./ResumeUploadView";
import ChecklistView from "./ChecklistView";

export default function Main() {
	const isOrganizer = useAtomValue(isOrganizerAtom);

	return (
		<ScrollArea className="flex-1 border-y lg:border-y-0 lg:border-r border-border">
			<main className="flex flex-col p-4 lg:p-8 gap-8">
				{isOrganizer && (
					<>
						<OrganizerView />

						<div className="w-full border-t border-dashed border-primary" />
					</>
				)}

				<AnnouncementsView />

				{!isOrganizer && <ChecklistView />}

				{!isOrganizer && <TeamView />}

				{!isOrganizer && <ResumeUploadView />}
			</main>
		</ScrollArea>
	);
}
