import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Import the functions you need from the SDKs you need
const firebaseConfig = {
  apiKey: 'AIzaSyB-PoP7yo2tPJixYZP6Le_MFgGSxd4p0g8',
  authDomain: 'time-since-107f1.firebaseapp.com',
  projectId: 'time-since-107f1',
  storageBucket: 'time-since-107f1.appspot.com',
  messagingSenderId: '340686957987',
  appId: '1:340686957987:web:09f21e22990ea8736a3e16',
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const firebaseDb = getFirestore(firebaseApp)
