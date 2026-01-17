import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import React from "react";

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
	time: string;
	title: string;
	description?: string;
	state?: "upcoming" | "current" | "passed";
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
	(
		{ time, title, description, state = "upcoming", className, ...props },
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn("relative pl-6 pb-6 group last:pb-0 ml-2", className)}
				{...props}
			>
				<div className="absolute left-[5px] top-2 h-full w-[2px] bg-border group-last:hidden">
					<div
						className={cn(
							"w-full transition-all duration-300 ease-in-out bg-primary",
							state === "passed" && "h-full",
							state === "current" && "h-0",
							state === "upcoming" && "h-0",
						)}
					/>
				</div>

				<div
					className={cn(
						"absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-primary",
						state === "passed" && "bg-primary",
						state === "upcoming" && "bg-background",
						state === "current" &&
							"bg-primary shadow-[0_0_15px_2px_var(--tw-shadow-color)] shadow-primary",
					)}
				/>

				{state === "current" && (
					<Play className="absolute -left-5 top-2 h-3 w-3 fill-primary text-primary" />
				)}

				<div className="flex flex-col gap-1">
					<span className="text-sm font-mono text-muted-foreground">
						{time}
					</span>
					<h4 className="text-base font-semibold leading-none">{title}</h4>
					{description && (
						<p className="text-base text-muted-foreground">{description}</p>
					)}
				</div>
			</div>
		);
	},
);
TimelineItem.displayName = "TimelineItem";

export function Timeline({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col">{children}</div>;
}
