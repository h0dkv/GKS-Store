// Импортиране на необходимите модули от Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ТВОЯТА КОНФИГУРАЦИЯ (Вземи я от Firebase Console -> Project Settings)
const firebaseConfig = {
    apiKey: "AIzaSyBbxuTXu50WYvlNsx4pdZsMcKt8FtcWzxc",
    authDomain: "gks-store.firebaseapp.com",
    projectId: "gks-store",
    storageBucket: "gks-store.firebasestorage.app",
    messagingSenderId: "578918555641",
    appId: "1:578918555641:web:8776277d020130bc522728"
};

// Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Правим функциите достъпни за другите файлове (script.js)
window.auth = auth;
window.db = db;
window.fb = {
    createUser: createUserWithEmailAndPassword,
    signIn: signInWithEmailAndPassword,
    onStateChange: onAuthStateChanged,
    logOut: signOut,
    // Firestore функции
    getDocs: getDocs,
    collection: collection,
    addDoc: addDoc
};

console.log("Firebase е свързан успешно!");