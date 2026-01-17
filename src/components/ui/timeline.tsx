import { cn } from "@/lib/utils";
import { ClockIcon, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineItemProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
	time: string;
	oldTime?: string;
	title: string;
	description?: string;
	state?: "upcoming" | "ongoing" | "ended";
	clickable?: boolean;
	onClick?: () => void;
	onReschedule?: (newTime: string) => void;
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
	(
		{
			time,
			oldTime,
			title,
			description,
			state = "upcoming",
			className,
			clickable,
			onClick,
			onReschedule,
			...props
		},
		ref,
	) => {
		const [isEditing, setIsEditing] = useState(false);
		const [editTime, setEditTime] = useState(time);
		const inputRef = useRef<HTMLInputElement>(null);

		useEffect(() => {
			if (isEditing) {
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		}, [isEditing]);

		useEffect(() => {
			setEditTime(time);
		}, [time]);

		const handleSave = () => {
			const trimmedTime = editTime.trim();

			if (trimmedTime !== "" && trimmedTime !== time) {
				onReschedule?.(trimmedTime);
			}

			setIsEditing(false);
		};

		const handleCancel = () => {
			setEditTime(time);
			setIsEditing(false);
		};

		return (
			// biome-ignore lint/a11y/noStaticElementInteractions: only organizers can click so accessibility is not a concern
			<div
				ref={ref}
				className={cn(
					"relative pl-6 pb-6 group last:pb-0 ml-2",
					clickable && "cursor-pointer",
					className,
				)}
				onClick={
					clickable
						? () => {
								if (!isEditing && onClick) {
									onClick();
								}
							}
						: undefined
				}
				onKeyDown={
					clickable
						? (e) => {
								if (
									!isEditing &&
									onClick &&
									(e.key === "Enter" || e.key === " ")
								) {
									e.preventDefault();
									onClick();
								}
							}
						: undefined
				}
				role={clickable ? "button" : undefined}
				tabIndex={clickable ? 0 : undefined}
				{...props}
			>
				<div className="absolute left-[5px] top-2 h-full w-[2px] bg-border group-last:hidden">
					<div
						className={cn(
							"w-full transition-all duration-300 ease-in-out bg-primary",
							state === "ended" && "h-full",
							state === "ongoing" && "h-0",
							state === "upcoming" && "h-0",
						)}
					/>
				</div>

				<div
					className={cn(
						"absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-primary",
						state === "ended" && "bg-primary",
						state === "upcoming" && "bg-background",
						state === "ongoing" &&
							"bg-primary shadow-[0_0_15px_2px_var(--tw-shadow-color)] shadow-primary",
					)}
				/>

				<Play
					className={cn(
						"absolute -left-5 top-2 h-3 w-3 fill-primary text-primary transition-all",
						state === "ongoing" ? "opacity-100" : "opacity-0",
						clickable &&
							"group-hover:opacity-100 group-hover:animate-caret-blink-reverse",
					)}
				/>

				<div className="flex flex-col gap-1">
					<span className="text-sm font-mono text-muted-foreground flex items-baseline gap-2 ">
						{isEditing ? (
							<input
								ref={inputRef}
								value={editTime}
								onChange={(e) => setEditTime(e.target.value)}
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => {
									e.stopPropagation();
									if (e.key === "Enter") {
										handleSave();
									} else if (e.key === "Escape") {
										handleCancel();
									}
								}}
								className="bg-transparent border-b border-primary focus:outline-none w-20 mr-auto"
							/>
						) : (
							<>
								{oldTime && (
									<span className="line-through decoration-primary opacity-50">
										{oldTime}
									</span>
								)}
								{time}
							</>
						)}
						{clickable && !isEditing && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setIsEditing(true);
								}}
								className="text-primary underline hover:text-primary/80 cursor-pointer ml-auto"
							>
								delay
							</button>
						)}
						{isEditing && (
							<div className="flex gap-2 text-sm">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleSave();
									}}
									className="text-primary underline hover:text-primary/80 cursor-pointer"
								>
									save (enter)
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleCancel();
									}}
									className="text-muted-foreground underline hover:text-muted-foreground/80 cursor-pointer"
								>
									cancel (esc)
								</button>
							</div>
						)}
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
