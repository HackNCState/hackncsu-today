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
					? "bg-white shadow-[0_0_25px_var(--tw-shadow-color)] shadow-primary/40 border border-primary/20"
					: "border border-border",
			)}
		>
			<p
				className={cn(
					recent ? "text-black font-bold text-xl" : "text-lg text-foreground",
				)}
			>
				{content}
			</p>
			<p
				className={cn(
					"ml-auto",
					recent ? "text-muted" : "text-muted-foreground",
				)}
			>
				{timestamp}
			</p>
		</div>
	);
}
