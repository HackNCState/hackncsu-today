import { MenuIcon } from "lucide-react";
import Countdown from "./Countdown";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import ResourcesList from "./ResourcesList";
import { authService } from "@/services/auth.service";
import { useAtomValue } from "jotai";
import { userAtom } from "@/atoms/user";

export default function Home() {
	const sampleResourcesSection = [
		{
			title: "Resources",
			items: [
				{
					label: "Rules",
					href: "#",
				},
				{
					label: "Tracks",
					href: "#",
				},
				{
					label: "Opening Slides",
					href: "#",
				},
				{
					label: "Judging Criteria",
					href: "#",
				},
			],
		},
		{
			title: "Quick Links",
			items: [
				{
					label: "Discord Server",
					href: "#",
				},
				{
					label: "Catering Menu",
					href: "#",
				},
			],
		},
		{
			title: "System",
			items: [
				{
					label: "Log out",
					href: () => authService.logout(),
				},
				{
					label: "About",
					href: () => alert("HackNC 2024 - Powered by NC State University"),
				},
			],
		},
	];

	const user = useAtomValue(userAtom);

	const resourcesContent = <ResourcesList sections={sampleResourcesSection} />;

	const sidebarFooter = (
		<footer className="font-playfair text-sm text-muted-foreground select-none">
			Hack_NCState Today
		</footer>
	);

	return (
		<div className="flex flex-col sm:flex-row items-stretch min-h-screen sm:h-screen sm:overflow-hidden">
			<header className="sr-only">
				<h1>Hack_NCState Today</h1>
				<h2>
					Welcome to Hack_NCState 2026! Your real-time event dashboard is here.
				</h2>
			</header>

			<nav className="flex flex-col gap-6 p-6 sm:w-55 sm:overflow-y-auto">
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

							{resourcesContent}

							<div className="mt-auto">{sidebarFooter}</div>
						</SheetContent>
					</Sheet>
				</div>

				<div className="hidden sm:flex flex-col gap-6">{resourcesContent}</div>

				<p>(temporary) {user?.username}</p>

				<div className="mt-auto hidden sm:block">{sidebarFooter}</div>
			</nav>

			<div className="flex-1 flex flex-col md:flex-row sm:overflow-y-auto md:overflow-hidden">
				<main className="bg-muted flex-1 p-8 md:overflow-y-auto">
					<p>Main content area</p> {user?.username}
				</main>

				<aside className="w-full md:w-72 md:overflow-y-auto">
					<p>auxiliary sidebar</p>
				</aside>
			</div>
		</div>
	);
}
