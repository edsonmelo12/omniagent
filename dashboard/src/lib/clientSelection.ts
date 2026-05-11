const CLIENT_SELECTION_KEY = "opensquad.dashboard.clientId";
const CLIENT_SELECTION_EVENT = "opensquad:client-selected";

type ClientSelectionCallback = (clientId: string) => void;

export const readSelectedClientId = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CLIENT_SELECTION_KEY) ?? "";
};

export const writeSelectedClientId = (clientId: string) => {
  if (typeof window === "undefined") return;

  if (clientId) {
    localStorage.setItem(CLIENT_SELECTION_KEY, clientId);
  } else {
    localStorage.removeItem(CLIENT_SELECTION_KEY);
  }

  window.dispatchEvent(new CustomEvent(CLIENT_SELECTION_EVENT, { detail: clientId }));
};

export const subscribeSelectedClientId = (callback: ClientSelectionCallback) => {
  if (typeof window === "undefined") return () => undefined;

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<string>;
    callback(customEvent.detail ?? "");
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CLIENT_SELECTION_KEY) {
      callback(event.newValue ?? "");
    }
  };

  window.addEventListener(CLIENT_SELECTION_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CLIENT_SELECTION_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
  };
};
