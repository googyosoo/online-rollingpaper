import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Types
export interface RollingPaper {
  id: string;
  title: string;
  createdAt: Timestamp;
  theme: string;
  font: string;
  password?: string;
  messageCount: number;
}

export interface Message {
  id: string;
  author: string;
  emoji: string;
  content: string;
  createdAt: Timestamp;
  hearts: number;
  paperId: string;
}

// Rolling Paper Functions
export async function createRollingPaper(
  title: string,
  password?: string
): Promise<string> {
  const docRef = await addDoc(collection(db, 'rollingPapers'), {
    title,
    password: password || null,
    theme: 'default',
    font: 'default',
    messageCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Admin: Create rolling paper with custom ID
export async function createRollingPaperWithCustomId(
  customId: string,
  title: string,
  password?: string
): Promise<string> {
  const { setDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'rollingPapers', customId);

  // Check if ID already exists
  const existingDoc = await getDoc(docRef);
  if (existingDoc.exists()) {
    throw new Error('이미 존재하는 ID입니다.');
  }

  await setDoc(docRef, {
    title,
    password: password || null,
    theme: 'default',
    font: 'default',
    messageCount: 0,
    createdAt: serverTimestamp(),
  });
  return customId;
}

export async function getRollingPaper(paperId: string): Promise<RollingPaper | null> {
  const docRef = doc(db, 'rollingPapers', paperId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RollingPaper;
  }
  return null;
}

export async function updateRollingPaperSettings(
  paperId: string,
  settings: { theme?: string; font?: string }
) {
  const docRef = doc(db, 'rollingPapers', paperId);
  await updateDoc(docRef, settings);
}

// Message Functions
export async function getMessages(paperId: string): Promise<Message[]> {
  const messagesRef = collection(db, 'rollingPapers', paperId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Message[];
}

export async function addMessage(
  paperId: string,
  message: { author: string; emoji: string; content: string }
): Promise<string> {
  const messagesRef = collection(db, 'rollingPapers', paperId, 'messages');
  const docRef = await addDoc(messagesRef, {
    ...message,
    hearts: 0,
    paperId,
    createdAt: serverTimestamp(),
  });

  // Update message count
  const paperRef = doc(db, 'rollingPapers', paperId);
  const paperSnap = await getDoc(paperRef);
  if (paperSnap.exists()) {
    await updateDoc(paperRef, {
      messageCount: (paperSnap.data().messageCount || 0) + 1
    });
  }

  return docRef.id;
}

export async function addHeart(paperId: string, messageId: string) {
  const messageRef = doc(db, 'rollingPapers', paperId, 'messages', messageId);
  const messageSnap = await getDoc(messageRef);

  if (messageSnap.exists()) {
    await updateDoc(messageRef, {
      hearts: (messageSnap.data().hearts || 0) + 1
    });
  }
}

export { db };
