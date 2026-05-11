const CONTENT_REFRESH_EVENT = "opensquad:content-refresh-requested";

type ContentRefreshCallback = (clientId: string | null) => void;

export const requestContentRefresh = (clientId: string | null = null) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(CONTENT_REFRESH_EVENT, { detail: clientId }));
};

export const subscribeContentRefresh = (callback: ContentRefreshCallback) => {
  if (typeof window === "undefined") return () => undefined;

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<string | null>;
    callback(customEvent.detail ?? null);
  };

  window.addEventListener(CONTENT_REFRESH_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener(CONTENT_REFRESH_EVENT, handleCustomEvent);
  };
};
