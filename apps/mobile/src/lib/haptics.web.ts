// Web has no haptics hardware; no-op so callers stay platform-agnostic.
export const haptics = {
  success: () => {},
  warning: () => {},
  error: () => {},
  tap: () => {},
};
