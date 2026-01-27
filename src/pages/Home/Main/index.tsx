import { useAtomValue } from "jotai";
import { isOrganizerAtom } from "@/atoms/user";
import OrganizerView from "./OrganizerView";
import TeamView from "./TeamView";
import AnnouncementsView from "./AnnouncementsView";
import ResumeUploadView from "./ResumeUploadView";
import ChecklistView from "./ChecklistView";

export default function Main() {
	const isOrganizer = useAtomValue(isOrganizerAtom);

	return (
		<main className="flex-1 flex flex-col p-4 lg:p-8 gap-8 lg:overflow-y-auto border-y lg:border-y-0 lg:border-r border-border">
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
	);
}
