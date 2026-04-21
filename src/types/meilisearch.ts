// Meilisearch types for FreeScout index

export interface MeilisearchHit {
  id: number;
  conv_id: number;
  subj: string;
  status: number;
  mid: number;
  uid: number;
  cid?: number;
  lr: string;
  ca: string;
  _rankingScore?: number;
}

export interface MeilisearchSearchResponse {
  hits: MeilisearchHit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export interface MeilisearchSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  status?: number[];
  mailboxId?: number[];
  userId?: number;
  customerId?: number;
}

export interface TransformedSearchResult {
  ticketId: number;
  subject: string;
  status: number;
  statusName: string;
  mailboxId: number;
  assignedUserId: number;
  lastReply: string;
  createdAt: string;
  rankingScore?: number;
}

export interface SearchResponse {
  query: string;
  totalHits: number;
  limit: number;
  offset: number;
  results: TransformedSearchResult[];
}
