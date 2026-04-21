// FreeScout API Types

export interface Conversation {
  id: number;
  number: number;
  threadsCount: number;
  type: string;
  folderId: number;
  status: string;
  state: string;
  subject: string;
  preview: string;
  mailboxId: number;
  assignee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy?: {
    id: number;
    type: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  userUpdatedAt?: string;
  customerWaitingSince?: {
    time: string;
    friendly: string;
    latestReplyFrom: string;
  };
  source?: {
    type: string;
    via: string;
  };
  cc?: string[];
  bcc?: string[];
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
  };
  _embedded?: {
    threads?: Thread[];
    tags?: Tag[];
    timelogs?: Timelog[];
  };
}

export interface Thread {
  id: number;
  type: string;
  status: string;
  state: string;
  action?: {
    type: string;
    text: string;
  };
  body: string;
  source?: {
    type: string;
    via: string;
  };
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
  };
  createdBy?: {
    id: number;
    type: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  to?: string[];
  cc?: string[];
  bcc?: string[];
  createdAt: string;
  openedAt?: string;
  savedReplyId?: number;
  _embedded?: {
    attachments?: Attachment[];
  };
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface Timelog {
  id: number;
  conversationId: number;
  userId: number;
  timeSpent: number;
  paused: boolean;
  finished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobTitle?: string;
  phone?: string;
  timezone?: string;
  photoUrl?: string;
}

export interface PaginatedResponse<T> {
  _embedded: {
    [key: string]: T[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface ConversationListParams {
  mailboxId?: number[];
  folderId?: number;
  status?: string;
  state?: string;
  type?: string;
  assignedTo?: number;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: number;
  number?: number;
  subject?: string;
  tag?: string;
  createdByUserId?: number;
  createdByCustomerId?: number;
  createdSince?: string;
  updatedSince?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  embed?: string;
}

export interface CreateThreadParams {
  conversationId: number;
  type: "customer" | "message" | "note";
  text: string;
  customerId?: number;
  customerEmail?: string;
  user?: number;
  imported?: boolean;
  status?: "active" | "pending" | "closed";
  state?: "draft" | "published";
  to?: string[];
  cc?: string[];
  bcc?: string[];
  createdAt?: string;
  attachments?: AttachmentInput[];
}

export interface AttachmentInput {
  fileName: string;
  mimeType: string;
  data?: string;
  fileUrl?: string;
}

export interface CreateThreadResponse {
  threadId: number | null;
  conversationId: number;
  type: string;
  status: string;
}
