import { storage } from "@/lib/firebase-config";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firestoreService } from "./firestore.service";

export const storageService = {
	uploadResume: async (userId: string, file: File) => {
		if (file.type !== "application/pdf") {
			throw new Error("Only PDF files are allowed.");
		}

		// we shall replace any existing resume
		const storageRef = ref(storage, `resumes/${userId}/resume.pdf`);

		const snapshot = await uploadBytes(storageRef, file, {
			contentType: file.type,
		});

        const url = await getDownloadURL(snapshot.ref);

        await firestoreService.updateUser(userId, {
            resumeURL: url,
        });

		return url;
	},
    
    deleteResume: async (userId: string) => {
        const storageRef = ref(storage, `resumes/${userId}/resume.pdf`);
        
        await deleteObject(storageRef);

        await firestoreService.updateUser(userId, {
            resumeURL: null,
        });
    },
};
