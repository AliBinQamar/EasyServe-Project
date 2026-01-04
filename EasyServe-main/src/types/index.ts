export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user';
  createdAt?: string;
}

export interface Provider {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  categoryId: string;
  categoryName: string;
  price: number;
  area: string;
  description: string;
  rating?: number;
  reviews?: Review[];
  createdAt?: string;
  role: 'provider';
}

export type AuthUser = User | Provider;

export interface Category {
  _id?: string;
  id?: string;
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

// ✅ BID INTERFACE - ONLY FOR BIDS
export interface Bid {
  _id?: string;
  serviceRequestId: string;
  providerId: string;
  providerName: string;
  proposedAmount: number;
  note?: string;
  estimatedTime?: string;
  attachments?: Array<{
    uri: string;
    type: 'image' | 'video';
    name: string;
    size?: number;
  }>;
  status: 'pending' | 'accepted' | 'rejected'; // ✅ BID STATUSES ONLY
  createdAt?: Date;
  updatedAt?: string;
}

export interface Transaction {
  _id?: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  status: 'pending' | 'completed' | 'withdrawn' | 'released';
  createdAt: string;
}

export interface Wallet {
  _id?: string;
  userId: string;
  userType: 'user' | 'provider';
  balance: number;
  heldBalance?: number;
  totalEarned?: number;
  totalSpent?: number;
  transactions?: Transaction[]; // <--- added this
  createdAt?: string;
  updatedAt?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
  };
  lastWithdrawal?: string;
}



// ✅ SERVICE REQUEST INTERFACE
export interface ServiceRequest {
  _id: string;
  userId: string;
  userName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  serviceAddress: string; 
  requestType: 'fixed' | 'bidding';
  fixedAmount?: number;
  biddingEndDate?: string;
  minBidAmount?: number;
  maxBidAmount?: number;
  status: 'open' | 'bidding' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedProviderId?: string;
  assignedProviderName?: string;
  acceptedBidId?: string;
  finalAmount?: number;
  images?: string[];
  createdAt: string;
}

// ✅ BOOKING INTERFACE - HAS ALL FIELDS
export interface Booking {
  _id?: string;
  requestId: string;
  bidId: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  serviceAddress: string; 
  agreedPrice: number;
  status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'payment-released';
  isPaid?: boolean; // ✅ ADDED
  transactionId?: string;
  completedByProvider?: boolean;
  completedByUser?: boolean;
  completedAt?: string;
  userRating?: number; // ✅ ADDED
  providerRating?: number;
  userReview?: string;
  createdAt?: string;
}