import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Countdown from "./Countdown";
import { MenuIcon } from "lucide-react";
import NavList from "./NavList";

export default function Nav() {
	const sidebarFooter = (
		<footer className="font-playfair text-sm text-muted-foreground select-none">
			Hack_NCState Today
		</footer>
	);

	return (
		<ScrollArea className="sm:w-56 sm:h-full">
			<nav className="flex flex-col gap-6 p-6 min-h-full">
				<div className="flex flex-row w-full justify-between items-start">
					<Countdown />

					<Sheet>
						<SheetTrigger className="sm:hidden hover:text-primary transition-colors">
							<MenuIcon />
						</SheetTrigger>

						<SheetContent side="top" className="p-6">
							<SheetHeader className="sr-only">
								<SheetTitle>Resources</SheetTitle>
								<SheetDescription>
									Quick access to important links and information.
								</SheetDescription>
							</SheetHeader>

							<NavList />

							<div className="mt-auto">{sidebarFooter}</div>
						</SheetContent>
					</Sheet>
				</div>

				<div className="hidden sm:flex flex-col gap-6">
					<NavList />
				</div>

				{/* <p>(temporary) {user?.username}</p> */}

				<div className="mt-auto hidden sm:block">{sidebarFooter}</div>
			</nav>
		</ScrollArea>
	);
}
