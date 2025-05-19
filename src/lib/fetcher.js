export async function fetcher(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('data', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: error.message || 'An unexpected error occurred.', status: 500 };
  }
} 