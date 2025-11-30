import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Provider } from '../types/provider';

export const providerService = {
    async getAll(): Promise<Provider[]> {
        const snapshot = await getDocs(collection(db, 'providers'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
    },

    async getByCategory(categoryId: string): Promise<Provider[]> {
        const q = query(collection(db, 'providers'), where('categoryId', '==', categoryId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
    },

    async getById(id: string): Promise<Provider | null> {
        const docSnap = await getDoc(doc(db, 'providers', id));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Provider : null;
    },

    async create(provider: Omit<Provider, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, 'providers'), {
            ...provider,
            createdAt: new Date()
        });
        return docRef.id;
    },

    async update(id: string, provider: Partial<Provider>): Promise<void> {
        await updateDoc(doc(db, 'providers', id), provider);
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, 'providers', id));
    }
};