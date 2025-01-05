interface SearchMatchData {
  mpn: string;
  manufacturer: string;
}

interface SearchQuoteData {
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

interface SearchQuotesRequest {
  data: SearchMatchData[];
}

interface SearchQuotesResponse {
  quotes: SearchQuoteData[];
}

interface Qty {
  value: number;
  uom: string;
}

interface PriceBreak {
  currency: string;
  price: number;
  qty: number | Qty;
}
