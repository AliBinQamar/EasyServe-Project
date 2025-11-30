import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Category } from '../types/category';

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const snapshot = await getDocs(collection(db, 'categories'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },

    async create(category: Omit<Category, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, 'categories'), {
            ...category,
            createdAt: new Date()
        });
        return docRef.id;
    },

    async update(id: string, category: Partial<Category>): Promise<void> {
        await updateDoc(doc(db, 'categories', id), category);
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, 'categories', id));
    }
};