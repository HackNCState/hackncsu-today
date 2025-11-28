import type { ResourcesListProps } from "./ResourcesListSection";
import ResourcesListSection from "./ResourcesListSection";

interface ResourcesSectionProps {
	sections: ResourcesListProps[];
}

export default function ResourcesList({ sections }: ResourcesSectionProps) {
	return (
		<div className="flex flex-col gap-6">
			{sections.map((section) => (
				<ResourcesListSection
					key={section.title}
					title={section.title}
					items={section.items}
				/>
			))}
		</div>
	);
}
