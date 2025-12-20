import FeedItem from "./FeedItem";

export default function Main() {
	return (
		<main className="flex-1 flex flex-col p-4 lg:p-8 gap-8 lg:overflow-y-auto border-y lg:border-y-0 lg:border-r border-border">
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
