// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyB9JMhJ0UX7eH39sAt-_lvDHW6N13AtmHI",
  authDomain: "edo-exhibition.firebaseapp.com",
  projectId: "edo-exhibition",
  storageBucket: "edo-exhibition.firebasestorage.app",
  messagingSenderId: "467742897930",
  appId: "1:467742897930:web:ad769c64635a29b82aacf3",
  measurementId: "G-XMVDFRR152"
};

// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);

// Firestore handle used in submit.js
const db = firebase.firestore();
