import { initializeApp } from 'firebase/app'
const firebaseConfig = {
  apiKey: 'AIzaSyAF9HH0qMRSlG5aFpuKLrQgO-m6rVp46DI',
  authDomain: 'swift-chat-13.firebaseapp.com',
  projectId: 'swift-chat-13',
  storageBucket: 'swift-chat-13.appspot.com',
  messagingSenderId: '271507097484',
  appId: '1:271507097484:web:47ec0679616e7634a4f8a9',
  measurementId: 'G-5ZDN6N82SC',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
try {
  // Note: this is still throwing a console error atm...
  import('firebase/analytics').then((analytics) => {
    analytics.getAnalytics(app)
  })
} catch (e) {
  console.warn('Analytics were blocked')
}
