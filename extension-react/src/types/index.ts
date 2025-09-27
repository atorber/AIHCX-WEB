export interface RequestHeaders {
  authorization?: string;
  'x-api-key'?: string;
  token?: string;
  ak?: string;
  sk?: string;
  region?: string;
  host?: string;
  'content-type'?: string;
  [key: string]: string | undefined;
}

export interface TaskParams {
  type: string;
  dataSource: string;
  priority: string;
  customParams: string;
  generated: string;
  name: string;
  commandScript: string;
  jsonItems: { title: string; text: string }[];
  yamlItems: { title: string; text: string }[];
  cliItems: { title: string; text: string; doc?: string }[];
  apiDocs: { title: string; text: string; requestExample?: string }[];
  chatConfig?: {
    serviceUrl: string;
    accessToken: string;
    basePath: string;
    serviceId?: string;
    isLoaded?: boolean;
  };
  chatLoading?: boolean;
  chatError?: string;
  isDataDownloadPage?: boolean;
}

export interface Message {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export interface PageInfo {
  isSupported: boolean;
  pageName: string;
  url: string;
  params: Record<string, string>;
}

export interface AIHCXHelperConfig {
  enabled: boolean;
  highlightImages: boolean;
  showImageInfo: boolean;
}

export interface Task {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  params: Record<string, any>;
  result?: Record<string, any>;
}

export interface BaiduCredentials {
  ak: string;
  sk: string;
  endpoint?: string;
}

export type TabType = 'cli' | 'commandScript' | 'json' | 'yaml' | 'apiDocs' | 'chat';