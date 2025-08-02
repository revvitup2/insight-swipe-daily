const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export interface YouTubeChannel {
  channel_id: string;
  display_name: string;
  profile_picture: string;
  subscribers: number;
  description: string;
  platform: string;
}

export const searchYouTubeChannels = async (
  query: string,
  maxResults: number = 5,
  token?: string
): Promise<YouTubeChannel[]> => {
  const response = await fetch(
    `${API_BASE_URL}/search/youtube-channels?query=${encodeURIComponent(
      query
    )}&max_results=${maxResults}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search YouTube channels");
  }

  return response.json();
};

export const addPersonalizedChannel = async (
  channelId: string,
  token: string
): Promise<{
  status: string;
  message: string;
  channel_id: string;
  is_personalised: boolean;
}> => {
  const response = await fetch(
    `${API_BASE_URL}/add-personalised-channel?channel_id=${channelId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add personalized channel");
  }

  return response.json();
};