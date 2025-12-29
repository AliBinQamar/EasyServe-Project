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

export interface Wallet {
  _id?: string;
  userId: string;
  userType: 'user' | 'provider';
  balance: number;
  heldBalance?: number;
  totalEarned?: number;
  totalSpent?: number;
  createdAt?: string;
}

export interface Transaction {
  _id?: string;
  userId: string;
  providerId?: string;
  amount: number;
  type: 'payment' | 'withdrawal' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  createdAt?: string;
}


// ✅ SERVICE REQUEST INTERFACE
export interface ServiceRequest {
  _id: string;
  userId: string;
  userName: string;
  categoryId: string;
  categoryName: string;
  description: string;
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
  agreedPrice: number;
  status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
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