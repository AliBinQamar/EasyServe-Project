// src/types/index.ts

export interface Category {
      id?: string;     // When backend uses id
    _id?: string;  
  name: string;
  icon?: string;
  createdAt?: Date;
}

export interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}
export interface Provider {
  _id?: string;  // MongoDB's ObjectId as string
  id?: string;   // Fallback
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  rating: number;
  area: string;
  description?: string;
  reviews?: Array<{
    userName: string;
    rating: number;
    comment: string;
  }>;
}

export interface Booking {
    id?: string;      // optional if you also have `id`
    _id?: string;     // add this
    userId: string;
    userName: string;
    providerId: string;
    providerName: string;
    date: string;
    time: string;
    note?: string;
    status: 'pending' | 'confirmed' | 'rejected';
    createdAt: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}