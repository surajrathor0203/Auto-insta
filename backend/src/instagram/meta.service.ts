import axios from "axios";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const GRAPH = "https://graph.facebook.com/v20.0";

export class MetaInstagramService {
  getOAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: env.META_REDIRECT_URI,
      state,
      response_type: "code",
      scope: "pages_show_list,instagram_basic,instagram_content_publish,business_management"
    });
    return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    if (!env.META_APP_ID || !env.META_APP_SECRET) throw new ApiError(503, "Meta credentials are not configured");
    const token = await axios.get(`${GRAPH}/oauth/access_token`, {
      params: { client_id: env.META_APP_ID, client_secret: env.META_APP_SECRET, redirect_uri: env.META_REDIRECT_URI, code }
    });
    const pages = await axios.get(`${GRAPH}/me/accounts`, { params: { access_token: token.data.access_token } });
    const page = pages.data.data?.[0];
    const pageDetails = await axios.get(`${GRAPH}/${page.id}`, {
      params: { fields: "instagram_business_account,access_token,name", access_token: token.data.access_token }
    });
    const instagramId = pageDetails.data.instagram_business_account?.id;
    if (!instagramId) throw new ApiError(400, "No Instagram Business account found");
    const profile = await axios.get(`${GRAPH}/${instagramId}`, {
      params: { fields: "username", access_token: pageDetails.data.access_token }
    });
    return {
      instagramId,
      username: profile.data.username,
      accessToken: pageDetails.data.access_token,
      pageId: page.id,
      tokenExpiresAt: token.data.expires_in ? new Date(Date.now() + token.data.expires_in * 1000) : undefined
    };
  }

  async publish(input: { instagramId: string; accessToken: string; imageUrl: string; caption: string }) {
    const media = await axios.post(`${GRAPH}/${input.instagramId}/media`, undefined, {
      params: { image_url: input.imageUrl, caption: input.caption, access_token: input.accessToken }
    });
    const publish = await axios.post(`${GRAPH}/${input.instagramId}/media_publish`, undefined, {
      params: { creation_id: media.data.id, access_token: input.accessToken }
    });
    return publish.data.id as string;
  }
}

export const metaInstagramService = new MetaInstagramService();
