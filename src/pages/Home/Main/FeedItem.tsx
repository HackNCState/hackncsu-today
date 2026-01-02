interface FeedItemProps {
	title: string;
	description?: string | null;
	children?: React.ReactNode;
}

export default function FeedItem({
	title,
	description,
	children,
}: FeedItemProps) {
	return (
		<article className="flex flex-col w-full gap-2">
			<h2 className="font-playfair font-semibold text-3xl">{title}</h2>
			{description && (
				<h3 className="font-synemono text-lg text-muted-foreground">
					{description}
				</h3>
			)}
			<div>{children}</div>
		</article>
	);
}
