import { MenuIcon } from "lucide-react";
import Countdown from "./Countdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ResourcesList from "./ResourcesList";
import ResourcesSection from "./ResourcesSection";

export default function Home() {
	const resourcesLinks = [
		{ label: "Discord Server", href: "#" },
		{ label: "Opening Slides", href: "#" },
		{ label: "Third Item", href: () => alert("You clicked Third Item!") },
	];

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
					href: () => alert("Logging out..."),
				},
				{
					label: "About",
					href: () => alert("HackNC 2024 - Powered by NC State University"),
				},
			],
		},
	];

	return (
		<div className="flex flex-col sm:flex-row items-stretch min-h-screen">
			<aside className="flex flex-col gap-6 p-6 sm:w-55">
				<div className="flex flex-row w-full justify-between items-start">
					<Countdown />

					<Sheet>
						<SheetTrigger className="sm:hidden hover:text-primary transition-colors">
							<MenuIcon />
						</SheetTrigger>
						<SheetContent side="top" className="p-6">
							<ResourcesSection sections={sampleResourcesSection} />
						</SheetContent>
					</Sheet>
				</div>

				<div className="hidden sm:flex flex-col gap-6">
					<ResourcesSection sections={sampleResourcesSection} />
				</div>
			</aside>

			<main className="bg-blue-500 flex-1">
				<p>Main content area</p>
			</main>
		</div>
	);
}
