import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { BadgeCheckIcon } from "lucide-react";

export default function UnapprovedView() {
	return (
		<Item variant="outline" className="mt-2">
			<ItemMedia>
				<BadgeCheckIcon className="size-5" />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					Thanks for submitting your team. Refer to your checklist for next
					steps on getting approved!
					<p className="mt-2 text-sm text-muted-foreground">
						Other members won't be able to see your team until it is approved.
					</p>
				</ItemTitle>
			</ItemContent>
		</Item>
	);
}
