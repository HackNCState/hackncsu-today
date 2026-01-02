import { Button } from "@/components/ui/button";
import FeedItem from "../FeedItem";
import { Maximize2 } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import {
	announcementsAtom,
	deleteAnnouncementAtom,
} from "@/atoms/event/announcements";
import { useAtomValue, useSetAtom } from "jotai";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	differenceInCalendarDays,
	differenceInMinutes,
	format,
	isToday,
} from "date-fns";
import { useEffect, useState } from "react";
import { isOrganizerAtom } from "@/atoms/user";

function formatAnnouncementTime(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diffMins = differenceInMinutes(now, date);

	if (diffMins < 1) return "now";
	if (diffMins < 10) {
		return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
	}

	if (isToday(date)) {
		return format(date, "h:mm a");
	}

	const diffDays = differenceInCalendarDays(now, date);
	if (diffDays === 1) return "yesterday";
	return `${diffDays} days ago`;
}

export default function AnnouncementsView() {
	const isOrganizer = useAtomValue(isOrganizerAtom);

	const announcements = useAtomValue(announcementsAtom);
	const deleteAnnouncement = useSetAtom(deleteAnnouncementAtom);
	const [, setTick] = useState(0);

	useEffect(() => {
		// update times every minute
		const interval = setInterval(() => {
			setTick((t) => t + 1);
		}, 60000);

		return () => clearInterval(interval);
	}, []);

	return (
		<FeedItem
			title="Announcements"
			description={
				announcements.length === 0
					? "Live updates about Hack_NCState will appear here."
					: null
			}
		>
			<div className="flex flex-col gap-2 mt-2">
				{announcements.slice(0, 3).map((announcement, index) => (
					<AnnouncementCard
						key={announcement.timestamp}
						content={announcement.content}
						timestamp={formatAnnouncementTime(announcement.timestamp)}
						highlight={
							index === 0 &&
							differenceInMinutes(
								new Date(),
								new Date(announcement.timestamp),
							) < 10
						}
					/>
				))}

				{(announcements.length > 3 ||
					(announcements.length > 0 && isOrganizer)) && (
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								className="flex flex-row gap-2 lg:justify-start lg:w-min"
							>
								<Maximize2 />
								{isOrganizer
									? "View and delete announcements"
									: `View all ${announcements.length} announcements`}
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[80vh] flex flex-col">
							<DialogHeader>
								<DialogTitle>All Announcements</DialogTitle>
							</DialogHeader>

							<div className="flex flex-col gap-2 overflow-y-auto pr-2">
								{announcements.map((announcement, index) => (
									<div
										key={announcement.timestamp}
										className="flex flex-row gap-2 items-start"
									>
										{isOrganizer && (
											<Button
												variant="link"
												className="p-0 h-auto text-destructive underline"
												onClick={() => deleteAnnouncement(index)}
											>
												Delete
											</Button>
										)}
										<p
											className={
												index === 0
													? "text-foreground font-medium"
													: "text-muted-foreground"
											}
										>
											<span className="font-mono text-xs mr-2 opacity-70">
												{formatAnnouncementTime(announcement.timestamp)}
											</span>
											— {announcement.content}
										</p>
									</div>
								))}
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</FeedItem>
	);
}
