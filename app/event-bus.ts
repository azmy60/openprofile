type EventHandler = (payload?: any) => void;

interface EventBus<T extends string> {
  on(key: T, handler: EventHandler): () => void;
  off(key: T, handler: EventHandler): void;
  emit(key: T, ...payload: Parameters<EventHandler>): void;
  once(key: T, handler: EventHandler): void;
}

type Bus = Record<string, EventHandler[]>;

export function createEventBus<T extends string>(config?: {
  onError: (...params: any[]) => void;
}): EventBus<T> {
  const bus: Bus = {};

  const off: EventBus<T>["off"] = (key, handler) => {
    const index = bus[key]?.indexOf(handler) ?? -1;
    bus[key]?.splice(index >>> 0, 1);
  };

  const on: EventBus<T>["on"] = (key, handler) => {
    if (!bus[key]) bus[key] = [];
    bus[key]?.push(handler);
    return () => {
      off(key, handler);
    };
  };

  const emit: EventBus<T>["emit"] = (key, ...payload) => {
    bus[key]?.forEach((handler) => {
      try {
        handler(payload);
      } catch (e) {
        config?.onError(e);
      }
    });
  };

  const once: EventBus<T>["once"] = (key, handler) => {
    const handleOnce = (...payload: Parameters<typeof handler>) => {
      handler(payload);
      off(key, handleOnce as typeof handler);
    };
    on(key, handleOnce as typeof handler);
  };

  return { on, off, emit, once };
}
