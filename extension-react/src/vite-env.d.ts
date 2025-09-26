/// <reference types="vite/client" />

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

// Chrome extension API types
declare const chrome: {
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
    openOptionsPage: () => void;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
    };
    lastError?: {
      message: string;
    };
  };
  storage: {
    sync: {
      get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback?: () => void) => void;
    };
    local: {
      get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback?: () => void) => void;
    };
  };
  tabs: {
    create: (createProperties: { url: string }) => void;
    query: (queryInfo: { active: boolean; currentWindow: boolean }, callback: (tabs: any[]) => void) => void;
    onUpdated: {
      addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
    };
  };
  sidePanel: {
    open: (options: { windowId?: number }) => Promise<void>;
  };
  action: {
    openPopup: () => void;
    onClicked: {
      addListener: (callback: (tab: any) => void) => void;
    };
  };
};

export {};