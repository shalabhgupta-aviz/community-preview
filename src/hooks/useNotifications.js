// hooks/useNotifications.js
import useSWR from 'swr';
import { useSession } from 'next-auth/react';

const fetcher = async (url, token) => {
  const response = await fetcher(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response;
};

export function useNotifications() {
  const { data: session } = useSession();
  const token = session?.wpJwt;

  const { data, error } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL_V1}/notifications`, token] : null,
    ([url, token]) => fetcher(url, token),
    { refreshInterval: 10000 }    // poll every 10s
  );

  return {
    notifications: data || [],
    loading: !error && !data,
    error: error || null
  };
}