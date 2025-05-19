import { fetcher } from '@/lib/fetcher';

// Mark a single notification as read, then navigate
export async function markOneAsRead(id, token) {
    await fetcher(`${process.env.NEXT_PUBLIC_API_URL_V1}/notifications/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {    
        'Authorization': `Bearer ${token}`
      }
    });     
  }
  
  // Mark all as read and clear the list
  export async function markAllAsRead(token) {
    await fetcher(`${process.env.NEXT_PUBLIC_API_URL_V1}/notifications/mark-all-read`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  export async function getNotifications(token) {
    const notifications = await fetcher(`${process.env.NEXT_PUBLIC_API_URL_V1}/notifications`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (notifications.status === 200) {
        return notifications.data;  
    }
    return [];
  }