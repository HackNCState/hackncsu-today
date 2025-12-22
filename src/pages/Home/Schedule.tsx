import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { useEffect, useRef } from "react";

type ScheduleItem = {
	time: string;
	title: string;
	description: string;
	state: "upcoming" | "current" | "passed";
};

type DaySchedule = {
	day: string;
	items: ScheduleItem[];
};

// temporary
const scheduleData: DaySchedule[] = [
	{
		day: "Day 1",
		items: [
			{
				time: "09:00 AM",
				title: "Check-in Starts",
				description: "Outside State Ballroom",
				state: "passed",
			},
			{
				time: "10:00 AM",
				title: "Opening Ceremony",
				description: "State Ballroom",
				state: "passed",
			},
			{
				time: "10:30 AM",
				title: "Team Formation",
				description: "State Ballroom",
				state: "passed",
			},
			{
				time: "11:00 AM",
				title: "Competition Begins",
				description: "All Venues",
				state: "current",
			},
			{
				time: "12:00 PM",
				title: "Lunch",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "02:00 PM",
				title: "Sponsor Workshop/Panel #1",
				description: "Talley Conference Room",
				state: "upcoming",
			},
			{
				time: "03:00 PM",
				title: "Sponsor Workshop/Panel #2",
				description: "Talley Conference Room",
				state: "upcoming",
			},
			{
				time: "04:00 PM",
				title: "Sponsor Workshop/Panel #3",
				description: "Talley Conference Room",
				state: "upcoming",
			},
			{
				time: "06:00 PM",
				title: "Dinner",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "06:05 PM",
				title: "Sponsor-led Dinner Activity",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "07:00 PM",
				title: "Sponsor Workshop/Panel #4",
				description: "Talley Conference Room",
				state: "upcoming",
			},
			{
				time: "09:00 PM",
				title: "Midnight Game Event",
				description: "State Ballroom",
				state: "upcoming",
			},
		],
	},
	{
		day: "Day 2",
		items: [
			{
				time: "12:00 AM",
				title: "Overnight Work Time",
				description: "Across Talley",
				state: "upcoming",
			},
			{
				time: "09:00 AM",
				title: "Breakfast",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "11:00 AM",
				title: "Project Submission",
				description: "Through DevPost",
				state: "upcoming",
			},
			{
				time: "12:00 PM",
				title: "Lunch",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "01:00 PM",
				title: "Judging Starts",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "03:00 PM",
				title: "Judging Ends",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "04:00 PM",
				title: "Closing Ceremony",
				description: "State Ballroom",
				state: "upcoming",
			},
			{
				time: "05:00 PM",
				title: "Event Ends",
				description: "All Venues",
				state: "upcoming",
			},
		],
	},
];

export default function Schedule() {
	const containerRef = useRef<HTMLDivElement>(null);
	const currentItemRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// this use effect is ai generated

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

	return (
		<aside className="w-full lg:w-96 lg:overflow-hidden flex flex-col">
			<div className="px-6 pt-6 pb-3 shrink-0">
				<h3 className="font-bold text-xl">Schedule</h3>
			</div>

			<div
				ref={containerRef}
				className="flex-1 px-6 pb-6 flex flex-col gap-2 lg:overflow-y-auto"
			>
				{scheduleData.map((day, dayIndex) => (
					<div key={day.day} className="flex flex-col gap-2">
						<h4
							className={
								dayIndex > 0
									? "mt-2 font-semibold text-muted-foreground"
									: "font-semibold text-muted-foreground"
							}
						>
							{day.day}
						</h4>
						<Timeline>
							{day.items.map((item) => (
								<TimelineItem
									key={item.title}
									ref={item.state === "current" ? currentItemRef : null}
									{...item}
								/>
							))}
						</Timeline>
					</div>
				))}
			</div>
		</aside>
	);
}
