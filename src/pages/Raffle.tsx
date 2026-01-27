import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Raffle() {
	const navigate = useNavigate();

	return (
		<div className="p-8 flex flex-col gap-4">
			<header className="flex flex-row items-center gap-2">
				<h1 className="font-playfair font-semibold text-xl sm:text-3xl">
					Draw Raffle Winners
				</h1>
				<Button
					onClick={() => {
						navigate(-1);
					}}
					variant="destructive"
					className="ml-auto"
				>
					go back
				</Button>
			</header>

			<main></main>
		</div>
	);
}
