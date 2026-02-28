// 1. Импортиране на Auth модули
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2. Импортиране на Firestore модули (ТОВА ЛИПСВАШЕ)
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBbxuTXu50WYvlNsx4pdZsMcKt8FtcWzxc",
    authDomain: "gks-store.firebaseapp.com",
    projectId: "gks-store",
    storageBucket: "gks-store.firebasestorage.app",
    messagingSenderId: "578918555641",
    appId: "1:578918555641:web:8776277d020130bc522728"
};

// Инициализиране
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Експортиране към глобалния обект window
window.auth = auth;
window.db = db;
window.fb = {
    createUser: createUserWithEmailAndPassword,
    signIn: signInWithEmailAndPassword,
    onStateChange: onAuthStateChanged,
    logOut: signOut,
    // Firestore функции - СЕГА ВЕЧЕ СА ДЕФИНИРАНИ
    getDocs: getDocs,
    collection: collection,
    addDoc: addDoc, // ТОВА Е ВАЖНО ЗА КАЧВАНЕТО
    doc: doc,
    getDoc: getDoc,
    setDoc: setDoc,
    updateDoc: updateDoc
};

console.log("Firebase & Firestore са свързани успешно!");