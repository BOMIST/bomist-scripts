import axios, { AxiosRequestConfig, Method } from "axios";
import consola from "consola";

export async function request(
  method: Method,
  url: string,
  config: AxiosRequestConfig = {}
) {
  try {
    let response = await axios.request({
      baseURL: "http://localhost:3333",
      method,
      url,
      ...config,
    });
    return response.data;
  } catch (err) {
    consola.error(err);
    throw err;
  }
}
