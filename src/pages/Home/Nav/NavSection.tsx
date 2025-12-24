import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Resource } from "@/types/event";
import { useState } from "react";

export type FunctionNavItem = {
	type: "function";
	label: string;
	onClick: () => void;
};

export type ResourceNavItem = {
	type: "resource";
	resource: Resource;
};

export type NavItem = ResourceNavItem | FunctionNavItem;

export interface NavSectionProps {
	title?: string;
	items?: NavItem[];
}

// THIS ENTIRE THING NEEDS TO BE REDONE IT IS SO UGLY

export default function NavSection({
	title = "Resources",
	items = [],
}: NavSectionProps) {
	const [selectedResource, setSelectedResource] = useState<Resource | null>(
		null,
	);

	return (
		<div className="flex flex-col gap-2">
			<h2 className="font-bold text-lg text-muted-foreground">{title}</h2>

			<ul className="flex flex-col gap-1 font-bold text-lg">
				{items.map((item) => {
					const key =
						item.type === "function" ? item.label : item.resource.label;
					return (
						<NavItemView
							key={key}
							item={item}
							onSelectResource={setSelectedResource}
						/>
					);
				})}
			</ul>

			<Dialog
				open={!!selectedResource}
				onOpenChange={(open) => !open && setSelectedResource(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedResource?.label}</DialogTitle>
					</DialogHeader>
					<div className="whitespace-pre-wrap">
						{selectedResource?.type === "text" ? selectedResource.content : ""}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function NavItemView({
	item,
	onSelectResource,
}: {
	item: NavItem;
	onSelectResource: (r: Resource) => void;
}) {
	const linkStyles =
		"hover:text-primary transition-colors underline-offset-4 hover:underline text-left";

	if (item.type === "function") {
		return (
			<li>
				<button type="button" onClick={item.onClick} className={linkStyles}>
					{item.label}
				</button>
			</li>
		);
	}

	const { resource } = item;

	if (resource.hidden) return null;

	if (resource.type === "link") {
		return (
			<li>
				<a
					href={resource.url}
					target="_blank"
					rel="noopener noreferrer"
					className={linkStyles}
				>
					{resource.label}
				</a>
			</li>
		);
	}

	return (
		<li>
			<button
				type="button"
				className={linkStyles}
				onClick={() => onSelectResource(resource)}
			>
				{resource.label}
			</button>
		</li>
	);
}
