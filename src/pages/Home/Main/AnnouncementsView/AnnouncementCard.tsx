import { cn } from "@/lib/utils";

interface AnnouncementCardProps {
	content: string;
	timestamp: string;
	highlight?: boolean;
}

export default function AnnouncementCard({
	content,
	timestamp,
	highlight: recent,
}: AnnouncementCardProps) {
	return (
		<div
			className={cn(
				"rounded-xl flex flex-wrap gap-2 items-center p-6 transition-all",
				recent
					? "bg-primary text-primary-foreground shadow-[0_0_25px_var(--tw-shadow-color)] shadow-primary/40 border border-primary/20"
					: "border border-border",
			)}
		>
			<p
				className={cn(recent ? "font-bold text-xl" : "text-lg text-foreground")}
			>
				{content}
			</p>
			<p
				className={cn(
					"ml-auto",
					recent ? "text-primary-foreground/80" : "text-muted-foreground",
				)}
			>
				{timestamp}
			</p>
		</div>
	);
}
