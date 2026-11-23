const listeners = new Map();

export const demoSocket = {
  on(event, callback) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(callback);
  },
  off(event, callback) {
    listeners.get(event)?.delete(callback);
  },
  emit(event, value) {
    listeners.get(event)?.forEach((callback) => callback(value));
  },
};
