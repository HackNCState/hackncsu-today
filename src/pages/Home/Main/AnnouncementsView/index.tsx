import { Button } from "@/components/ui/button";
import FeedItem from "../FeedItem";
import { Maximize2 } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementsView() {
	return (
		<FeedItem
			title="Announcements"
			description="Updates regarding the event will appear here."
		>
			{/* <p>No new announcements.</p> */}

			<div className="flex flex-col gap-2">
				<AnnouncementCard
					highlight
					content="Judging will begin at 11:30 AM because we fucked up and shit got delayed. Sorry!!"
					timestamp="11:23"
				/>

				<AnnouncementCard
					content="Cheese is now legal for all minors and adults. I hope you like that"
					timestamp="11:23"
				/>

				<AnnouncementCard
					content="Cheese is now legal for all minors and adults."
					timestamp="11:23"
				/>

				<Button
					variant="ghost"
					className="flex flex-row gap-2 lg:justify-start lg:w-min"
				>
					<Maximize2 />
					View all 5 announcements
				</Button>
			</div>
		</FeedItem>
	);
}
