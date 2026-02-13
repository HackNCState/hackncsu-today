import JSZip from "jszip";
import type { Participant } from "@/types/user";

export async function exportResumesZip(
	participants: Participant[],
): Promise<void> {
	const withResumes = participants.filter(
		(p): p is Participant & { resumeURL: string } => !!p.resumeURL,
	);

	if (withResumes.length === 0) {
		alert("No participants have uploaded resumes.");
		return;
	}

	const zip = new JSZip();
	let added = 0;

	await Promise.all(
		withResumes.map(async (p) => {
			try {
				const response = await fetch(p.resumeURL);
				if (!response.ok) return;

				const blob = await response.blob();
				const filename = `${p.firstName}_${p.lastName}_${p.username}.pdf`;
				zip.file(filename, blob);
				added++;
			} catch (err) {
				console.warn(`Failed to fetch resume for ${p.username}`, err);
			}
		}),
	);

	if (added === 0) {
		alert("Could not download any resumes. Check the console for errors.");
		return;
	}

	const content = await zip.generateAsync({ type: "blob" });
	const url = URL.createObjectURL(content);

	const link = document.createElement("a");
	link.href = url;
	link.download = `resumes-${new Date().toISOString().slice(0, 10)}.zip`;
	link.click();

	URL.revokeObjectURL(url);
}
