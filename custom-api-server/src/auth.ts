import Boom from "@hapi/boom";
import {
  Request,
  ResponseToolkit,
  Server,
  ServerAuthSchemeObject,
  ServerAuthSchemeOptions,
} from "@hapi/hapi";
import assert from "assert";

async function authenticate(request: Request, h: ResponseToolkit) {
  const authKeys = (process.env.AUTH_KEYS || "custom-api-key")
    .split(",")
    .filter(Boolean) as string[];

  assert("authKeys cannot be empty");

  const apiKey = (request.headers["x-api-key"] || "").trim();
  if (!apiKey || !authKeys.includes(apiKey)) {
    return Boom.unauthorized();
  }

  return h.authenticated({
    credentials: {
      api_key: apiKey,
    },
  });
}

export default {
  authenticate,
  scheme: function (
    _server: Server,
    _opts?: ServerAuthSchemeOptions
  ): ServerAuthSchemeObject {
    return {
      authenticate,
    };
  },
};
