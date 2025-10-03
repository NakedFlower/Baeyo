// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔽 여기 firebaseConfig는 콘솔에서 복사한 값 붙여넣기
const firebaseConfig = {
  apiKey: "AIzaSyCBB0JWAycfnvnbKSPxnBaN-6mTMnwaWI8",
  authDomain: "delivery-groupbuy-c6bae.firebaseapp.com",
  projectId: "delivery-groupbuy-c6bae",
  storageBucket: "delivery-groupbuy-c6bae.firebasestorage.app",
  messagingSenderId: "589957493747",
  appId: "1:589957493747:web:c9ee78c578236eacb09886"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// 로그인 함수
export const login = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// 이메일/비밀번호 인증 유틸
export const signupWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const subscribeAuth = (callback) => onAuthStateChanged(auth, callback);
