import { Config } from "../config/loader.js";
import { FreeScoutError } from "../utils/errors.js";
import type {
  Conversation,
  User,
  Tag,
  PaginatedResponse,
  ConversationListParams,
  CreateThreadParams,
  CreateThreadResponse,
} from "../types/freescout.js";

export class FreeScoutClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: Config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
  }

  private getHeaders(withContentType = false): Record<string, string> {
    const headers: Record<string, string> = {
      "X-FreeScout-API-Key": this.apiKey,
      Accept: "application/json",
    };
    if (withContentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          parts.push(`${key}=${value.join(",")}`);
        }
      } else {
        parts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
    return parts.length > 0 ? `?${parts.join("&")}` : "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(!!options.body),
        ...(options.headers as Record<string, string>),
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMessage += `: ${errorBody}`;
        }
      } catch {
        // Ignore error reading body
      }
      throw new FreeScoutError(errorMessage, response.status, endpoint);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }

    return {} as T;
  }

  async listConversations(
    params: ConversationListParams = {}
  ): Promise<PaginatedResponse<Conversation>> {
    // Check if we need to filter for unassigned conversations (assignedTo=0)
    // The FreeScout API doesn't properly handle assignedTo=0, so we filter client-side
    const filterUnassigned = params.assignedTo === 0;

    const queryParams: Record<string, unknown> = {
      mailboxId: params.mailboxId,
      folderId: params.folderId,
      status: params.status,
      state: params.state,
      type: params.type,
      // Omit assignedTo if filtering for unassigned (will filter client-side)
      assignedTo: filterUnassigned ? undefined : params.assignedTo,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      customerId: params.customerId,
      number: params.number,
      subject: params.subject,
      tag: params.tag,
      createdByUserId: params.createdByUserId,
      createdByCustomerId: params.createdByCustomerId,
      createdSince: params.createdSince,
      updatedSince: params.updatedSince,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
      page: params.page,
      pageSize: params.pageSize,
      embed: params.embed,
    };

    const queryString = this.buildQueryString(queryParams);
    const response = await this.request<PaginatedResponse<Conversation>>(
      `/api/conversations${queryString}`
    );

    // Apply client-side filtering for unassigned conversations if needed
    if (filterUnassigned) {
      const conversationsKey = Object.keys(response._embedded)[0];
      const allConversations = response._embedded[conversationsKey] || [];

      // Filter to only unassigned conversations (where assignee is undefined/null)
      const unassignedConversations = allConversations.filter(
        (conv) => !conv.assignee
      );

      // Update pagination metadata
      const filteredTotalElements = unassignedConversations.length;
      const pageSize = response.page.size;
      const filteredTotalPages = Math.ceil(filteredTotalElements / (pageSize || 1));

      return {
        _embedded: {
          [conversationsKey]: unassignedConversations,
        },
        page: {
          ...response.page,
          totalElements: filteredTotalElements,
          totalPages: filteredTotalPages,
        },
      };
    }

    return response;
  }

  async getConversation(
    id: number,
    embed = "threads"
  ): Promise<Conversation> {
    const queryString = embed ? `?embed=${encodeURIComponent(embed)}` : "";
    return this.request<Conversation>(`/api/conversations/${id}${queryString}`);
  }

  async listUsers(params: {
    email?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<User>> {
    const queryString = this.buildQueryString(params);
    return this.request<PaginatedResponse<User>>(`/api/users${queryString}`);
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/api/users/${id}`);
  }

  async createThread(params: CreateThreadParams): Promise<CreateThreadResponse> {
    const { conversationId, ...bodyParams } = params;

    // Build the request body
    const body: Record<string, unknown> = {
      type: bodyParams.type,
      text: bodyParams.text,
    };

    // Add customer info for customer threads
    if (bodyParams.customerId) {
      body.customer = { id: bodyParams.customerId };
    } else if (bodyParams.customerEmail) {
      body.customer = { email: bodyParams.customerEmail };
    }

    // Add other optional fields
    if (bodyParams.user !== undefined) body.user = bodyParams.user;
    if (bodyParams.imported !== undefined) body.imported = bodyParams.imported;
    if (bodyParams.status) body.status = bodyParams.status;
    if (bodyParams.state) body.state = bodyParams.state;
    if (bodyParams.to && bodyParams.to.length > 0) body.to = bodyParams.to;
    if (bodyParams.cc && bodyParams.cc.length > 0) body.cc = bodyParams.cc;
    if (bodyParams.bcc && bodyParams.bcc.length > 0) body.bcc = bodyParams.bcc;
    if (bodyParams.createdAt) body.createdAt = bodyParams.createdAt;
    if (bodyParams.attachments && bodyParams.attachments.length > 0) {
      body.attachments = bodyParams.attachments;
    }

    const response = await fetch(
      `${this.baseUrl}/api/conversations/${conversationId}/threads`,
      {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMessage += `: ${errorBody}`;
        }
      } catch {
        // Ignore error reading body
      }
      throw new FreeScoutError(
        errorMessage,
        response.status,
        `/api/conversations/${conversationId}/threads`
      );
    }

    // Get thread ID from Resource-ID header
    const threadId = response.headers.get("Resource-ID");

    return {
      threadId: threadId ? parseInt(threadId, 10) : null,
      conversationId,
      type: bodyParams.type,
      status: "created",
    };
  }

  async listTags(params: {
    conversationId?: number;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<Tag>> {
    const queryString = this.buildQueryString(params);
    return this.request<PaginatedResponse<Tag>>(`/api/tags${queryString}`);
  }

  async setTags(conversationId: number, tags: string[]): Promise<void> {
    await this.request(`/api/conversations/${conversationId}/tags`, {
      method: "PUT",
      body: JSON.stringify({ tags }),
    });
  }
}
