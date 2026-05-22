import "server-only";

export const ROCKY_PROVIDER_CONFIG = {
  gmail: {
    authConfigEnv: "COMPOSIO_GMAIL_AUTH_CONFIG_ID",
    toolkit: "gmail",
  },
  google_sheets: {
    authConfigEnv: "COMPOSIO_GOOGLE_SHEETS_AUTH_CONFIG_ID",
    toolkit: "googlesheets",
  },
  google_drive: {
    authConfigEnv: "COMPOSIO_GOOGLE_DRIVE_AUTH_CONFIG_ID",
    toolkit: "googledrive",
  },
  github: {
    authConfigEnv: "COMPOSIO_GITHUB_AUTH_CONFIG_ID",
    toolkit: "github",
  },
  notion: {
    authConfigEnv: "COMPOSIO_NOTION_AUTH_CONFIG_ID",
    toolkit: "notion",
  },
  youtube: {
    authConfigEnv: "COMPOSIO_YOUTUBE_AUTH_CONFIG_ID",
    toolkit: "youtube",
  },
};

export function getRockyProviderConfig(provider) {
  const config = ROCKY_PROVIDER_CONFIG[provider];

  if (!config) {
    return null;
  }

  return {
    ...config,
    id: provider,
    authConfigId: process.env[config.authConfigEnv] || null,
  };
}

export function isSupportedProvider(provider) {
  return Boolean(getRockyProviderConfig(provider));
}
