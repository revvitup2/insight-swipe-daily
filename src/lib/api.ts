// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginAdmin = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

export const fetchFeedItems = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/feed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feed items');
  }

  return response.json();
};

export const updateFeedItem = async (
  token: string,
  id: string,
  data: {
    influencer_id?: string;
    metadata?: { title?: string };
    analysis?: { summary?: string };
  }
) => {
  const response = await fetch(`${API_BASE_URL}/admin/feed-items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update feed item');
  }

  return response.json();
};

export const fetchInfluencers = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/influencers/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch influencers');
  }

  return response.json();
};

export const createInfluencer = async (
  token: string,
  data: {
    channel_id: string;
    industry: string;
    industry_type: string;
    platform: string;
  }
) => {
  const response = await fetch(`${API_BASE_URL}/admin/influencers/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create influencer');
  }

  return response.json();
};

// src/lib/api.ts
export const deleteFeedItem = async (token: string, id: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/feed-items/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete feed item');
  }

  return response.json();
};