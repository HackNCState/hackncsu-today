import { useAtomValue } from "jotai";
import FeedItem from "../FeedItem";
import { completedChecklistStatusesAtom } from "@/atoms/user";
import { checklistItemsAtom } from "@/atoms/event/checklistItems";
import { FieldGroup } from "@/components/ui/field";
import ChecklistItemRow from "./ChecklistItemRow";

export default function ChecklistView() {
	const checklistItemStatuses = useAtomValue(completedChecklistStatusesAtom);
	const checklistItems = useAtomValue(checklistItemsAtom);

	return (
		<FeedItem
			title="Checklist"
			description="Use the checklist below as a guide to stay on track during the event."
		>
			<FieldGroup className="gap-1">
				{checklistItems.map((item) => {
					const status = checklistItemStatuses.find((s) => s.id === item.id);
					const isChecked = status?.completed || false;

					return (
						<ChecklistItemRow key={item.id} item={item} isChecked={isChecked} />
					);
				})}
			</FieldGroup>
		</FeedItem>
	);
}
