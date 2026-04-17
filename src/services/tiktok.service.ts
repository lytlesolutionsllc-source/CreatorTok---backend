import axios from 'axios';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

export async function refreshTikTokToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';

  const response = await axios.post(`${TIKTOK_API_BASE}/oauth/token/`, {
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token, expires_in } = response.data;

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
  };
}

export async function getUserInfo(accessToken: string): Promise<{
  openId: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
}> {
  const response = await axios.get(`${TIKTOK_API_BASE}/user/info/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      fields: 'open_id,display_name,avatar_url,follower_count',
    },
  });

  const { open_id, display_name, avatar_url, follower_count } = response.data.data.user;

  return {
    openId: open_id,
    displayName: display_name,
    avatarUrl: avatar_url,
    followerCount: follower_count,
  };
}
