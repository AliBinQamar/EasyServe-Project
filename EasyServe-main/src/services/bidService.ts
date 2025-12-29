import axios from "../config/api";
import { Bid } from "../types";

export const bidService = {
  create: async (bid: Partial<Bid>): Promise<Bid> => {
    const res = await axios.post("/bids", bid);
    return res.data;
  },

  getMyBids: async (providerId?: string): Promise<Bid[]> => {
    const res = await axios.get(`/service-requests/provider-bids/${providerId}`);
    return res.data;
  },

  updateStatus: async (bidId: string, status: "accepted" | "rejected"): Promise<Bid> => {
    const res = await axios.patch(`/bids/${bidId}/status`, { status });
    return res.data;
  },
};
