import { useAuth } from "@clerk/nextjs";

export const useApi = () => {
  const { getToken } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    // 1. Get the JWT token from Clerk
    const token = await getToken();

    // 2. Set up headers with the Bearer token
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    };

    // 3. Perform the fetch
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(response)

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  };

  return { fetchWithAuth };
};