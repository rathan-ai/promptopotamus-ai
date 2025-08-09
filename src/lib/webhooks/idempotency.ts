// Shared idempotency handling for webhooks
interface ProcessedEvent {
  timestamp: number;
  status: string;
}

// In production, use Redis or database for persistence
const processedEvents = new Map<string, ProcessedEvent>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function cleanIdempotencyCache(): void {
  const now = Date.now();
  for (const [eventId, data] of processedEvents.entries()) {
    if (now - data.timestamp > IDEMPOTENCY_TTL) {
      processedEvents.delete(eventId);
    }
  }
}

export function isEventProcessed(eventId: string): boolean {
  cleanIdempotencyCache();
  return processedEvents.has(eventId);
}

export function markEventProcessed(eventId: string, status: string): void {
  processedEvents.set(eventId, {
    timestamp: Date.now(),
    status
  });
}

export function getProcessedEventStatus(eventId: string): string | null {
  const event = processedEvents.get(eventId);
  return event ? event.status : null;
}