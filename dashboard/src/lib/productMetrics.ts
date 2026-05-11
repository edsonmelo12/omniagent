const EVENT_NAME = "opensquad:product-metrics";

export type ProductMetricEvent = {
  eventName: string;
  clientId?: string | null;
  source?: string | null;
  timestamp: string;
};

export const recordProductMetric = (event: Omit<ProductMetricEvent, "timestamp">) => {
  if (typeof window === "undefined") return;

  const nextEvent: ProductMetricEvent = {
    ...event,
    clientId: event.clientId ?? null,
    source: event.source ?? null,
    timestamp: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextEvent }));
  return nextEvent;
};

export const recordOfferMetric = (event: Omit<ProductMetricEvent, "timestamp">) =>
  recordProductMetric({
    ...event,
    eventName: event.eventName.startsWith("offer_") ? event.eventName : event.eventName.replace(/^product_/, "offer_"),
  });

export const subscribeProductMetricEvents = (callback: (event: ProductMetricEvent) => void) => {
  if (typeof window === "undefined") return () => undefined;

  const handle = (event: Event) => {
    const customEvent = event as CustomEvent<ProductMetricEvent>;
    if (!customEvent.detail) return;
    callback(customEvent.detail);
  };

  window.addEventListener(EVENT_NAME, handle);

  return () => {
    window.removeEventListener(EVENT_NAME, handle);
  };
};

export const subscribeOfferMetricEvents = subscribeProductMetricEvents;
