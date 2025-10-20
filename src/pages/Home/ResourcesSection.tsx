import type { ResourcesListProps } from "./ResourcesList";
import ResourcesList from "./ResourcesList";

interface ResourcesSectionProps {
	sections: ResourcesListProps[];
}

export default function ResourcesSection({ sections }: ResourcesSectionProps) {
	return (
		<div className="flex flex-col gap-6">
			{sections.map((section, index) => (
				<ResourcesList
					key={index}
					title={section.title}
					items={section.items}
				/>
			))}
		</div>
	);
}
