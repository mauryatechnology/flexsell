const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const isMockMode = 
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || 
  !process.env.NEXT_PUBLIC_API_URL;

// Helper to simulate network latency in mock mode
export const delay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  info?: any;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    let data: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || `HTTP error! Status: ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      500
    );
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => 
    request<T>(path, { ...options, method: "GET" }),
    
  post: <T>(path: string, body?: any, options?: RequestInit) => 
    request<T>(path, { 
      ...options, 
      method: "POST", 
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  put: <T>(path: string, body?: any, options?: RequestInit) => 
    request<T>(path, { 
      ...options, 
      method: "PUT", 
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  delete: <T>(path: string, options?: RequestInit) => 
    request<T>(path, { ...options, method: "DELETE" }),
};
