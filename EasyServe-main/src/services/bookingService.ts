import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking } from '../types/booking';

export const bookingService = {
    async getAll(): Promise<Booking[]> {
        const snapshot = await getDocs(collection(db, 'bookings'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    },

    async getByUserId(userId: string): Promise<Booking[]> {
        const q = query(collection(db, 'bookings'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    },

    async create(booking: Omit<Booking, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, 'bookings'), {
            ...booking,
            createdAt: new Date()
        });
        return docRef.id;
    },

    async updateStatus(id: string, status: 'pending' | 'confirmed' | 'rejected'): Promise<void> {
        await updateDoc(doc(db, 'bookings', id), { status });
    }
};