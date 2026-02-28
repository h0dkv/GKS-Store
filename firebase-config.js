// 1. Импортиране на Auth модули
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2. Импортиране на Firestore модули (СЪБРАНИ НА ЕДНО МЯСТО)
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    setDoc,
    getDoc,
    updateDoc
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
    // Firestore функции
    db: db,
    doc: doc,
    setDoc: setDoc,
    getDoc: getDoc,
    addDoc: addDoc,
    collection: collection,
    getDocs: getDocs,
    query: query,
    where: where,
    updateDoc: updateDoc
};

console.log("✅ Firebase & Firestore са свързани успешно!");