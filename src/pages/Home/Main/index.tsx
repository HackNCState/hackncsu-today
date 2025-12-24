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
				title="Your Team"
				description="View and manage your team information here."
			>
				<p>Sample text within this space.</p>
			</FeedItem>

			<FeedItem
				title="Checklist"
				description="Your team's to-do list to stay on track."
			>
				<p>Sample text within this space. You will need a team.</p>
			</FeedItem>
		</main>
	);
}
