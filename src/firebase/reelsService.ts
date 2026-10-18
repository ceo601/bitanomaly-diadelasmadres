import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './config.ts';

export interface SavedReel {
  id: string;
  userId: string;
  authorName: string;
  momName: string;
  humorQuote: string;
  emotionalQuote: string;
  frameStyle: string;
  cartoonPose: string;
  photoUrl: string;
  likesCount: number;
  createdAt: string;
  isPublic: boolean;
}

export async function saveReelToFirestore(reelData: Omit<SavedReel, 'id' | 'userId' | 'createdAt' | 'likesCount'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesión con Google para guardar en la nube');
  }

  const reelId = `reel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `reels/${reelId}`;

  const payload: SavedReel = {
    id: reelId,
    userId: user.uid,
    authorName: reelData.authorName || user.displayName || 'Hijo/a',
    momName: reelData.momName || 'Mamá',
    humorQuote: reelData.humorQuote,
    emotionalQuote: reelData.emotionalQuote,
    frameStyle: reelData.frameStyle || 'comic-pop',
    cartoonPose: reelData.cartoonPose || 'sweater',
    photoUrl: reelData.photoUrl || '',
    likesCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: true,
  };

  try {
    await setDoc(doc(db, 'reels', reelId), payload);
    return reelId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteReelFromFirestore(reelId: string): Promise<void> {
  const path = `reels/${reelId}`;
  try {
    await deleteDoc(doc(db, 'reels', reelId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function likeReelInFirestore(reelId: string): Promise<void> {
  const path = `reels/${reelId}`;
  try {
    await updateDoc(doc(db, 'reels', reelId), {
      likesCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToCommunityReels(
  onUpdate: (reels: SavedReel[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'reels';
  try {
    const q = query(
      collection(db, 'reels'),
      where('isPublic', '==', true),
      limit(20)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: SavedReel[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as SavedReel);
        });
        // Sort in client by createdAt descending
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(items);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getUserSavedReels(userId: string): Promise<SavedReel[]> {
  const path = 'reels';
  try {
    const q = query(collection(db, 'reels'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const items: SavedReel[] = [];
    snap.forEach((d) => items.push(d.data() as SavedReel));
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
