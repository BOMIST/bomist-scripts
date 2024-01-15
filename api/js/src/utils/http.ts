import axios, { AxiosRequestConfig, Method } from "axios";

const HOST = "http://localhost";
const PORT = 3333;

export async function request(
  method: Method,
  url: string,
  config: AxiosRequestConfig = {}
) {
  try {
    let response = await axios.request({
      baseURL: `${HOST}:${PORT}`,
      method,
      url,
      ...config,
    });
    return response.data;
  } catch (err) {
    // consola.error(err);
    throw err;
  }
}

export async function search(selector: any, params = {}) {
  return await request("POST", "/search", {
    data: {
      selector,
    },
    params,
  });
}

export async function searchOne(selector: any, params = {}) {
  return (
    await search(selector, {
      ...params,
      limit: 1,
    })
  )[0];
}
