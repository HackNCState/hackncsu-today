import {
	rescheduleItemAtom,
	schedulesAtom,
	setCurrentItemAtom,
} from "@/atoms/event/schedule";
import { isOrganizerAtom } from "@/atoms/user";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { functionsService } from "@/services/functions.service";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

export default function Schedule() {
	const scheduleData = useAtomValue(schedulesAtom);
	const isOrganizer = useAtomValue(isOrganizerAtom);
	const setCurrentItem = useSetAtom(setCurrentItemAtom);
	const rescheduleItem = useSetAtom(rescheduleItemAtom);

	const containerRef = useRef<HTMLDivElement>(null);
	const currentItemRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: necessary to only run when scheduleData changes
	useEffect(() => {
		// this use effect is ai generated btw

		if (currentItemRef.current && containerRef.current) {
			// Check if screen is lg (1024px) or larger
			if (window.matchMedia("(min-width: 1024px)").matches) {
				const container = containerRef.current;
				const item = currentItemRef.current;

				const containerRect = container.getBoundingClientRect();
				const itemRect = item.getBoundingClientRect();

				// Calculate the position of the item relative to the container's current scroll position
				const relativeTop = itemRect.top - containerRect.top;
				const currentScrollTop = container.scrollTop;

				// Scroll so item is in the middle
				container.scrollTo({
					top:
						currentScrollTop +
						relativeTop -
						container.clientHeight / 2 +
						item.clientHeight / 2,
					behavior: "smooth",
				});
			}
		}
	}, [scheduleData]);

	const handleItemClick = useCallback(
		(dayIdx: number, itemIdx: number) => {
			if (isOrganizer) {
				setCurrentItem(dayIdx, itemIdx);
			}
		},
		[isOrganizer, setCurrentItem],
	);

	return (
		<aside className="w-full lg:w-96 lg:overflow-hidden flex flex-col">
			<div className="px-6 pt-6 pb-3 shrink-0 flex flex-row gap-4 items-center">
				<h3 className="font-bold text-xl">Schedule</h3>

				{isOrganizer && (
					<>
						<button
							type="button"
							onClick={() => functionsService.loadSchedule()}
							className="text-primary underline hover:text-primary/80 cursor-pointer ml-auto"
						>
							{scheduleData.length === 0 ? "import from run of show" : "sync"}
						</button>

						{scheduleData.length !== 0 && (
							<button
								type="button"
								onClick={() => handleItemClick(-1, 0)}
								className="text-primary underline hover:text-primary/80 cursor-pointer"
							>
								reset
							</button>
						)}
					</>
				)}
			</div>

			{scheduleData.length > 0 ? (
				<div
					ref={containerRef}
					className="flex-1 px-6 pb-6 flex flex-col gap-2 lg:overflow-y-auto"
				>
					{isOrganizer && (
						<div className="mb-2 flex flex-col gap-2">
							<p className="text-sm text-muted-foreground">
								Click on an item to move the timeline.
							</p>
							<p className="text-sm text-muted-foreground">
								Click 'delay' on an item to change the time of an event.
								Participants will see the old time crossed out. Great for
								delays! (e.g. late lunch or something)
							</p>
							<p className="text-sm text-muted-foreground">
								'sync' will pull in any updates from the run-of-show spreadsheet
								in the google drive. It will try to preserve the timeline for
								minimal disruption to participants.
							</p>
							<p className="text-sm text-muted-foreground">
								'reset' will set the timeline back to the start
							</p>
						</div>
					)}

					{scheduleData.map((day, dayIndex) => (
						<div key={day.title} className="flex flex-col gap-2">
							<h4
								className={
									dayIndex > 0
										? "mt-2 font-semibold text-muted-foreground"
										: "font-semibold text-muted-foreground"
								}
							>
								{day.title}
							</h4>
							<Timeline>
								{day.items.map((item, itemIndex) => (
									<TimelineItem
										clickable={isOrganizer}
										oldTime={item.oldTime}
										onClick={() => handleItemClick(dayIndex, itemIndex)}
										onReschedule={(newTime) =>
											rescheduleItem(dayIndex, itemIndex, newTime)
										}
										key={item.title}
										ref={item.state === "ongoing" ? currentItemRef : null}
										{...item}
									/>
								))}
							</Timeline>
						</div>
					))}
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center px-6 pb-6 text-center">
					<p className="text-muted-foreground">
						You'll see the schedule here once it's available.
					</p>
				</div>
			)}
		</aside>
	);
}
