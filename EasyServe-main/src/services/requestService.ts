import api from '../config/api';

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
  status: 'open' | 'bidding' | 'assigned' | 'in-progress' | 'completed';
  assignedProviderId?: string;
  acceptedBidId?: string;
  finalAmount?: number;
  createdAt: string;
}

export interface Bid {
  _id: string;
  serviceRequestId: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  proposedAmount: number;
  note?: string;
  estimatedTime?: string;
  status: 'pending' | 'accepted' | 'rejected';
  rating?: number;
  review?: string;
  createdAt: string;
}

export const requestService = {
  // Get all service requests
  async getAll(params?: { 
    userId?: string; 
    status?: string; 
    requestType?: string 
  }) {
    const res = await api.get('/service-requests', { params });
    return res.data;
  },

  // Create service request
  async create(data: Partial<ServiceRequest>) {
    const res = await api.post('/service-requests', data);
    return res.data.request;
  },

  // Get bids for a service request
  async getBids(serviceRequestId: string) {
    const res = await api.get(`/service-requests/${serviceRequestId}/bids`);
    return res.data;
  },

  // Place a bid
  async placeBid(data: {
    serviceRequestId: string;
    providerId: string;
    providerName: string;
    proposedAmount: number;
    note?: string;
    estimatedTime?: string;
  }) {
    const res = await api.post('/service-requests/bid', data);
    return res.data.bid;
  },

  // Accept a bid
  async acceptBid(bidId: string) {
    const res = await api.post('/service-requests/accept-bid', { bidId });
    return res.data.serviceRequest;
  },

  // Get provider's bids
  async getProviderBids(providerId: string) {
    const res = await api.get(`/service-requests/provider-bids/${providerId}`);
    return res.data;
  },
  async acceptFixedRequest(data: { requestId: string; providerId: string; providerName: string }) {
  const res = await api.post('/service-requests/accept-fixed', data);
  return res.data.request; // returns the updated service request
}
};