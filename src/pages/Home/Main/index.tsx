import { useAtomValue } from "jotai";
import FeedItem from "./FeedItem";
import { isOrganizerAtom } from "@/atoms/user";
import OrganizerView from "./OrganizerView";
import AnnouncementCard from "./AnnouncementsView/AnnouncementCard";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import AnnouncementsView from "./AnnouncementsView";

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

			<FeedItem
				title="// TODO"
				description="Your team's checklist to stay on track."
			></FeedItem>

			<FeedItem
				title="Your Team"
				description="View and manage your team."
			></FeedItem>

			<FeedItem
				title="Resume Upload"
				description="Want to share your resume with our sponsors? Upload it here!"
			></FeedItem>
		</main>
	);
}
