import { Request, Server } from "@hapi/hapi";
import random from "random";
import {
  SearchMatchData,
  SearchQuoteData,
  SearchQuotesRequest,
  SearchQuotesResponse,
} from "./types";

export default (server: Server) => {
  server.route({
    method: "GET",
    path: "/test",
    options: {
      auth: {
        strategy: "api_key",
      },
    },
    handler: () => {
      return null;
    },
  });

  server.route({
    method: "POST",
    path: "/search_quotes",
    options: {
      auth: {
        strategy: "api_key",
      },
    },
    handler: (request: Request) => {
      const { data } = request.payload as SearchQuotesRequest;

      const response: SearchQuotesResponse = { quotes: [] };

      for (let matchData of data) {
        const quote = createDummyQuote(matchData);
        response.quotes.push(quote);
      }

      return response;
    },
  });
};

function createDummyQuote(matchData: SearchMatchData): SearchQuoteData {
  const { mpn, manufacturer } = matchData;
  return {
    mpn,
    manufacturer,
    priceBreaks: [...new Array(random.int(1, 5))].map((_, index) => ({
      qty: index * 10 || 1,
      price: parseFloat(random.float(0.1, 100).toFixed(2)),
      currency: random.choice(["USD", "EUR", "GBP"])!,
    })),
    product: {
      sku: `SKU-${mpn}`,
      url: `https://google.com/search?q=${mpn}`,
    },
    supplier: {
      name: "Custom Supplier",
      url: `https://bomist.com`,
    },
    inStock: random.int(100, 5000),
    orderMultiple: random.int(1, 100),
    packaging: random.choice(["Cut-tape", "Reel"])!,
    leadTime: `${random.int(1, 50)} wk`,
  };
}
