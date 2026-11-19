import '@testing-library/jest-dom/vitest';

// jsdom has no ResizeObserver; Polpo modals observe their size even while closed.
if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: class {
      observe = () => undefined;
      unobserve = () => undefined;
      disconnect = () => undefined;
    },
  });
}
