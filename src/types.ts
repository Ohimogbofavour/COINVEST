export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  profits: number;
  totalWithdrawn: number;
  activeInvestmentsAmount: number;
  referralsEarned: number;
  referralCode: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  joinedAt: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'payout' | 'referral';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'under_review';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  method: string;
  timestamp: string;
  status: TransactionStatus;
  details: string;
  txHash?: string;
}

export interface Investment {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  startDate: string;
  endDate: string;
  dailyRoi: number;
  durationDays: number;
  status: 'active' | 'completed';
  totalEarned: number;
  lastClaimDate: string;
}

export type TradeType = 'buy' | 'sell';
export type TradeStatus = 'open' | 'closed';

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage: number;
  timestamp: string;
  pnl: number;
  status: TradeStatus;
  closedPrice?: number;
}

export interface CopyTrader {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  roi30D: number;
  aum: number;
  riskScore: number;
  copiers: number;
  preferredAsset: string;
  isCopied?: boolean;
  copiedAmount?: number;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  min: number;
  max: number;
  dailyRoi: number;
  durationDays: number;
  description: string;
  features: string[];
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'stock' | 'commodity';
  price: number;
  change24h: number;
  history24h: number[];
}
