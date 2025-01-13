export interface SearchQuotesRequest {
  data: SearchMatchData[];
}

export interface SearchQuotesResponse {
  quotes: SearchQuoteData[];
}

export interface SearchMatchData {
  mpn: string;
  manufacturer: string;
}

export interface SearchQuoteData {
  mpn: string;
  manufacturer: string;
  priceBreaks: PriceBreak[];
  inStock?: number | Qty | null;
  orderMultiple?: number | Qty;
  leadTime?: string;
  packaging?: string;
  product?: {
    sku: string;
    url?: string;
  };
  supplier?: {
    name: string;
    url?: string;
  };
}

export interface Qty {
  value: number;
  uom: string;
}

export interface PriceBreak {
  currency: string;
  price: number;
  qty: number | Qty;
}
