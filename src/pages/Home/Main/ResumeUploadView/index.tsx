import { userAtom } from "@/atoms/user";
import { cn } from "@/lib/utils";
import { storageService } from "@/services/storage.service";
import { useAtomValue } from "jotai";
import { AlertCircle, CheckCircle, FileText, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import FeedItem from "../FeedItem";

export default function ResumeUploadView() {
	const user = useAtomValue(userAtom);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const [message, setMessage] = useState("");

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!user) return;
			if (acceptedFiles.length === 0) return;

			const file = acceptedFiles[0];
			setIsUploading(true);
			setUploadStatus("idle");
			setMessage("");

			try {
				await storageService.uploadResume(user.id, file);
				setUploadStatus("success");
				setMessage(`Uploaded: ${file.name}`);
			} catch (error) {
				console.error(error);
				setUploadStatus("error");
				setMessage("Failed to upload resume. Please try again.");
			} finally {
				setIsUploading(false);
			}
		},
		[user],
	);

	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
		},
		maxSize: 5 * 1024 * 1024, // 5MB
		multiple: false,
		noClick: true,
		onDropRejected: (fileRejections) => {
			setUploadStatus("error");
			const error = fileRejections[0]?.errors[0];
			if (error?.code === "file-invalid-type") {
				setMessage("Only PDF files are allowed.");
			} else if (error?.code === "file-too-large") {
				setMessage("File size must be less than 5MB.");
			} else {
				setMessage(error?.message || "Invalid file.");
			}
		},
	});

	const handleDelete = useCallback(async () => {
		if (!user) return;

		await storageService.deleteResume(user.id);

		setUploadStatus("idle");
		setMessage("Resume deleted.");
	}, [user]);

	if (!user || user.role !== "participant") return null;

	return (
		<FeedItem
			title="Resume Upload"
			description="Want to share your resume with our sponsors? Upload it here!"
		>
			<div
				{...getRootProps()}
				className={cn(
					"mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors duration-200 w-full outline-none",
					isDragActive
						? "border-primary bg-primary/10"
						: "border-muted-foreground/25",
				)}
			>
				<input {...getInputProps()} />

				<div className="flex flex-col items-center gap-3 text-center">
					{isUploading ? (
						<Loader2 className="h-10 w-10 animate-spin text-primary" />
					) : uploadStatus === "success" ? (
						<CheckCircle className="h-10 w-10 text-green-500" />
					) : uploadStatus === "error" ? (
						<AlertCircle className="h-10 w-10 text-destructive" />
					) : (
						<FileText className="h-10 w-10 text-muted-foreground" />
					)}

					<div className="flex flex-col gap-1">
						<p className="text-sm font-medium">
							{isUploading
								? "Uploading..."
								: isDragActive
									? "Drop your resume here"
									: user.resumeURL
										? "Thanks for submitting! Drag and drop again to update."
										: "Just drag and drop your resume here"}
						</p>

						{message ? (
							<p
								className={cn(
									"text-xs",
									uploadStatus === "error"
										? "text-destructive"
										: uploadStatus === "success"
											? "text-green-500"
											: "text-muted-foreground",
								)}
							>
								{message}
							</p>
						) : (
							<p className="text-xs text-muted-foreground">
								5 MB max file size
							</p>
						)}

						{!isUploading && (
							<button
								type="button"
								className="text-xs text-muted-foreground underline hover:text-primary cursor-pointer mt-1"
								onClick={open}
							>
								Upload manually
							</button>
						)}

						{user.resumeURL && (
							<div className="flex flex-row items-center justify-center gap-2">
								<a
									href={user.resumeURL}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary underline hover:text-primary/80 cursor-pointer mt-1"
								>
									View submission
								</a>

								<button
									type="button"
									className="text-xs text-destructive underline hover:text-destructive/80 cursor-pointer mt-1"
									onClick={handleDelete}
								>
									Delete submission
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</FeedItem>
	);
}
