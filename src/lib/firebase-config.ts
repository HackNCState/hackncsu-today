// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyDw7jjs3fAbi6pxiOO4_omWefLTAjf72lw",
	authDomain: "hackncsu-today.firebaseapp.com",
	projectId: "hackncsu-today",
	storageBucket: "hackncsu-today.firebasestorage.app",
	messagingSenderId: "638064491024",
	appId: "1:638064491024:web:f32d36e7170d5a39e9a895",
	measurementId: "G-MMCWYB3KX0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (import.meta.env.DEV) {
	console.log("Firebase initialized in development mode");

	connectAuthEmulator(auth, "http://localhost:9099");
	connectFirestoreEmulator(firestore, "localhost", 5500);
	connectFunctionsEmulator(functions, "localhost", 5001);
	connectStorageEmulator(storage, "localhost", 9199);
}