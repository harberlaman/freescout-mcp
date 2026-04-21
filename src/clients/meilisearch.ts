import { MeilisearchConfig } from "../config/loader.js";
import { MeilisearchError } from "../utils/errors.js";
import type {
  MeilisearchSearchParams,
  MeilisearchSearchResponse,
  SearchResponse,
  TransformedSearchResult,
} from "../types/meilisearch.js";

const STATUS_NAMES: Record<number, string> = {
  1: "active",
  2: "pending",
  3: "closed",
};

export class MeilisearchClient {
  private host: string;
  private apiKey: string;

  constructor(config: MeilisearchConfig) {
    this.host = config.host.replace(/\/$/, "");
    this.apiKey = config.apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private buildFilterString(params: MeilisearchSearchParams): string {
    const filters: string[] = [];

    if (params.status && params.status.length > 0) {
      filters.push(`status IN [${params.status.join(", ")}]`);
    }

    if (params.mailboxId && params.mailboxId.length > 0) {
      filters.push(`mid IN [${params.mailboxId.join(", ")}]`);
    }

    if (params.userId !== undefined) {
      filters.push(`uid = ${params.userId}`);
    }

    if (params.customerId !== undefined) {
      filters.push(`cid = ${params.customerId}`);
    }

    return filters.join(" AND ");
  }

  async search(params: MeilisearchSearchParams): Promise<SearchResponse> {
    const url = `${this.host}/indexes/freescout/search`;

    const payload: Record<string, unknown> = {
      q: params.query,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      sort: ["lr:desc"],
      attributesToRetrieve: [
        "id",
        "conv_id",
        "subj",
        "status",
        "mid",
        "uid",
        "lr",
        "ca",
        "_rankingScore",
      ],
      showRankingScore: true,
    };

    const filterString = this.buildFilterString(params);
    if (filterString) {
      payload.filter = filterString;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
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
      throw new MeilisearchError(errorMessage, response.status);
    }

    const data = (await response.json()) as MeilisearchSearchResponse;

    // Transform hits to readable field names
    const results: TransformedSearchResult[] = data.hits.map((hit) => ({
      ticketId: hit.conv_id,
      subject: hit.subj,
      status: hit.status,
      statusName: STATUS_NAMES[hit.status] ?? "unknown",
      mailboxId: hit.mid,
      assignedUserId: hit.uid,
      lastReply: hit.lr,
      createdAt: hit.ca,
      rankingScore: hit._rankingScore,
    }));

    return {
      query: data.query,
      totalHits: data.estimatedTotalHits,
      limit: data.limit,
      offset: data.offset,
      results,
    };
  }
}
