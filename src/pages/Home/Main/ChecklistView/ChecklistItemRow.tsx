import { useState } from "react";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldTitle,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown } from "lucide-react";
import type { ChecklistItem } from "@/types/event";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChecklistItemRowProps {
	item: ChecklistItem;
	isChecked: boolean;
	onToggle?: (id: string, checked: boolean) => void;
}

export default function ChecklistItemRow({
	item,
	isChecked,
	onToggle,
}: ChecklistItemRowProps) {
	const [isOpen, setIsOpen] = useState(false);

	function checkboxBuilder() {
		return (
			<Checkbox
				id={`checklist-${item.id}`}
				name={`checklist-${item.id}`}
				checked={isChecked}
				disabled={item.autoCheck}
				onClick={(e) => e.stopPropagation()}
				onCheckedChange={(checked: boolean) => onToggle?.(item.id, checked)}
				className={cn(item.autoCheck && "border-dashed")}
			/>
		);
	}

	return (
		<div>
			<Field orientation="horizontal">
				{item.autoCheck ? (
					<Tooltip>
						<TooltipTrigger asChild>{checkboxBuilder()}</TooltipTrigger>
						<TooltipContent side="right">
							<p>
								{isChecked
									? "We checked this one off for you."
									: "We'll check this one off for you."}
							</p>
						</TooltipContent>
					</Tooltip>
				) : (
					checkboxBuilder()
				)}
				<FieldContent className="gap-1">
					<button
						type="button"
						className="flex items-center justify-between gap-2 text-left cursor-pointer w-full"
						onClick={() => setIsOpen((prev) => !prev)}
						aria-expanded={isOpen}
						aria-controls={`checklist-desc-${item.id}`}
					>
						<FieldTitle>{item.title}</FieldTitle>
						<ChevronDown
							className={`size-4 text-muted-foreground transition ${
								isOpen ? "rotate-180" : "rotate-0"
							}`}
						/>
					</button>
					<div
						className={`grid transition-[grid-template-rows,opacity] duration-200 ${
							isOpen
								? "grid-rows-[1fr] opacity-100"
								: "grid-rows-[0fr] opacity-0"
						}`}
					>
						<div id={`checklist-desc-${item.id}`} className="overflow-hidden">
							<FieldDescription className="prose prose-slate dark:prose-invert max-w-none">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										a: ({ children, href }) => (
											<a
												href={href}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(event) => event.stopPropagation()}
											>
												{children}
											</a>
										),
									}}
								>
									{item.description}
								</ReactMarkdown>
							</FieldDescription>
						</div>
					</div>
				</FieldContent>
			</Field>
		</div>
	);
}
