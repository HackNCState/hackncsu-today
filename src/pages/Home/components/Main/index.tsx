import { useAtomValue } from "jotai";
import FeedItem from "./FeedItem";
import { userAtom } from "@/atoms/user";

export default function Main() {
	const user = useAtomValue(userAtom);

	return (
		<main className="flex-1 flex flex-col p-4 lg:p-8 gap-8 lg:overflow-y-auto border-y lg:border-y-0 lg:border-r border-border">
			{user?.role === "organizer" && (
				<>
					<FeedItem
						title="Organizer Dashboard"
						description="Manage event settings and monitor overall progress."
					>
						<p>TBA UI</p>
					</FeedItem>

					<div className="w-full border-t border-dashed border-primary" />
				</>
			)}

			<FeedItem
				title="Announcements"
				description="Updates regarding the event will appear here."
			>
				<p>No new announcements.</p>
			</FeedItem>

			<FeedItem
				title="Checklist"
				description="Your personal to-do list for the event to stay on track."
			>
				<p>Sample text within this space.</p>
			</FeedItem>

			<FeedItem
				title="Your Team"
				description="View and manage your team information here."
			>
				<p>Sample text within this space.</p>
			</FeedItem>
		</main>
	);
}
