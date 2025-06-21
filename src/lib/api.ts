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

export const updateInfluencerPause = async (
  token: string,
  influencerId: string,
  isPause: boolean
) => {
  const response = await fetch(`${API_BASE_URL}/admin/influencers/${influencerId}/pause`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ is_pause: isPause }),
  });

  if (!response.ok) {
    throw new Error('Failed to update influencer pause status');
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

// Google Auth API
export const googleAuth = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({token}),
  });

  if (!response.ok) {
    throw new Error('Google authentication failed');
  }

  return response.json();
};

// User Preferences API
export const updateFollowedChannels = async (token: string, channelId: string, follow: boolean) => {
  const response = await fetch(`${API_BASE_URL}/follow-channel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ channel_id: channelId, follow }),
  });

  if (!response.ok) {
    throw new Error('Failed to update followed channels');
  }

  return response.json();
};

export const updateUserCategories = async (token: string, categories: string[]) => {
  const response = await fetch(`${API_BASE_URL}/user/update-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ categories }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user categories');
  }

  return response.json();
};

export const saveUserPreferences = async (token: string, preferences: {
  selected_categories: string[];

}) => {
  // First update categories
  await updateUserCategories(token, preferences.selected_categories);

};

// lib/api.ts
export const getUserPreferences = async (token: string): Promise<{ selected_categories: string[] }> => {
  const response = await fetch(`${API_BASE_URL}/user/get-categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user categories');
  }

  return response.json();
};

// src/lib/api.ts

// Save a feed item
export const saveFeedItem = async (token: string, videoId: string) => {
  const response = await fetch(`${API_BASE_URL}/user/saved-feeds/${videoId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || 'Failed to save feed item';
    
    // Create an error object with status for better error handling
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};
// Get all saved feed items
export const getSavedFeedItems = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/user/saved-feeds`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch saved feed items');
  }

  return response.json();
};

// Remove a saved feed item
export const removeSavedFeedItem = async (token: string, videoId: string) => {
  const response = await fetch(`${API_BASE_URL}/user/saved-feeds/${videoId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  
  });

  if (!response.ok) {
    throw new Error('Failed to remove saved feed item');
  }

  return response.json();
};

