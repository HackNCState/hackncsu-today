import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { BadgeCheckIcon } from "lucide-react";

export default function UnapprovedView() {
    return (
        <Item variant="outline" className="mt-2">
          <ItemMedia>
            <BadgeCheckIcon className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Thank you for submitting! Please visit an organizer with your team to complete the verification process.</ItemTitle>
          </ItemContent>
      </Item>
    );
}