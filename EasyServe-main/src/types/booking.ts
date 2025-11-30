export interface Booking {
    id: string;
    userId: string;
    userName: string;
    providerId: string;
    providerName: string;
    date: string;
    time: string;
    note?: string;
    status: 'pending' | 'confirmed' | 'rejected';
    createdAt: Date;
}