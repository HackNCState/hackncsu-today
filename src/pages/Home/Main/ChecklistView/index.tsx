import { useAtomValue, useSetAtom } from "jotai";
import FeedItem from "../FeedItem";
import {
	completedChecklistStatusesAtom,
	setChecklistStatusAtom,
} from "@/atoms/user";
import { checklistItemsAtom } from "@/atoms/event/checklistItems";
import { FieldGroup } from "@/components/ui/field";
import ChecklistItemRow from "./ChecklistItemRow";

export default function ChecklistView() {
	const checklistItemStatuses = useAtomValue(completedChecklistStatusesAtom);
	const checklistItems = useAtomValue(checklistItemsAtom);

	const setChecklistStatus = useSetAtom(setChecklistStatusAtom);

	function handleToggle(id: string, checked: boolean) {
		setChecklistStatus(id, checked);
	}

	return (
		<FeedItem
			title="Your Hack_NCState Checklist"
			description="Use the checklist below as a guide to stay on track during the event. Click an item to view more details."
		>
			<FieldGroup className="gap-1">
				{checklistItems.map((item) => {
					const status = checklistItemStatuses.find((s) => s.id === item.id);
					const isChecked = status?.completed || false;

					return (
						<ChecklistItemRow
							key={item.id}
							item={item}
							isChecked={isChecked}
							onToggle={handleToggle}
						/>
					);
				})}
			</FieldGroup>
		</FeedItem>
	);
}
