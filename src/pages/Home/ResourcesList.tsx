export interface ResourcesListProps {
	title?: string;
	items?: ResourceItemProps[];
}

interface ResourceItemProps {
	label: string;
	href: string | (() => void);
}

export default function ResourcesList({
	title = "Resources",
	items = [],
}: ResourcesListProps) {
	const linkStyles =
		"hover:text-primary transition-colors underline-offset-4 hover:underline text-left";

	return (
		<div className="flex flex-col gap-2">
			<h2 className="font-bold text-lg text-muted-foreground">{title}</h2>

			<ul className="flex flex-col gap-1 font-bold text-lg">
				{items.map((item) => (
					<li key={item.label}>
						{typeof item.href === "function" ? (
							<button type="button" onClick={item.href} className={linkStyles}>
								{item.label}
							</button>
						) : (
							<a href={item.href} className={linkStyles}>
								{item.label}
							</a>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
