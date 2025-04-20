import ky from "ky";
import { revalidatePath } from "next/cache";

type ConstructUrlProps = {
  endpoint: string;
  page?: number;
  size?: number;
  id?: string;
  minArea?: string | number;
  maxArea?: string | number;
  oilspill?: string;
};

export async function getSession(): Promise<string | null> {
  return null;
}

export function constructUrl(urlParams: ConstructUrlProps): string {
  const { 
    endpoint,
    size,
    page,
    id,
    minArea,
    maxArea,
    oilspill
  } = urlParams;
  const finalUrl: string = `${endpoint}`;
  const params = new URLSearchParams();

  if (page !== undefined && !isNaN(page)) {
    params.append("page", page.toString());
  }

  if (size !== undefined && !isNaN(size)) {
    params.append("size", size.toString());
  }

  if (id !== undefined) {
    params.append("id", id.toString());
  }

  if (minArea !== undefined) {
    params.append("minArea", minArea.toString());
  }

  if (maxArea !== undefined) {
    params.append("maxArea", maxArea.toString());
  }

  if (oilspill !== undefined) {
    params.append("oilspill", oilspill.toString());
  }

  const url = `${finalUrl}?${params.toString()}`;
  return url;
}

export const constructHeaders = (): HeadersInit => ({
  "Content-Type": "application/json"
});

export const requestKy = ky.create({
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getSession();
        if (!token) {
          throw new Error("401");
        }

        const headers = constructHeaders();

        Object.entries(headers).forEach(([key, value]) => {
          if (value) {
            request.headers.set(key, String(value));
          }
        });
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        const path = new URL(request.url).pathname;
        if (
          request.method === "PUT" ||
          request.method === "POST" ||
          request.method === "PATCH" ||
          request.method === "DELETE"
        ) {
          if (response.status === 201 || response.status === 200) {
            revalidatePath(path || "/");
          }
        }
        if (
          request.method === "PUT" ||
          request.method === "POST" ||
          request.method === "PATCH"
        ) {
          if (
            response.status === 409 ||
            response.status === 400 ||
            response.status === 405
          ) {
            revalidatePath(path || "/");
          }
        }

        if (request.method === "GET") {
          if (response.status === 401) {
            throw new Error("401");
          }
          if (
            response.status === 500 ||
            response.status === 404 ||
            response.status === 400
          ) {
            throw new Error(`Server Error: ${await response.text()}`);
          }
        }
      },
    ],
  },
});
