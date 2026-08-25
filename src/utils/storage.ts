export const setItem = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getItem = (key: string) => {
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    // If value wasn't JSON (older entries or raw strings), return raw string
    return item;
  }
};

export const removeItem = (key: string) => {
  localStorage.removeItem(key);
};

export const setSessionItem = (key: string, value: unknown) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSessionItem = (key: string) => {
  const item = sessionStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return item;
  }
};

export const removeSessionItem = (key: string) => {
  sessionStorage.removeItem(key);
};
