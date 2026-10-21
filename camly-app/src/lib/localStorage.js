export function readMigratedLocalStorage(key, legacyKeys = []) {
  try {
    const current = localStorage.getItem(key);
    if (current !== null) return current;

    for (const legacyKey of legacyKeys) {
      const legacyValue = localStorage.getItem(legacyKey);
      if (legacyValue === null) continue;
      localStorage.setItem(key, legacyValue);
      localStorage.removeItem(legacyKey);
      return legacyValue;
    }
  } catch (error) {
    console.warn('No se pudo migrar una preferencia local:', error);
  }

  return null;
}

export function migratePersistedStorage(legacyKey) {
  return {
    getItem(key) {
      try {
        let value = localStorage.getItem(key);
        if (value === null) {
          value = localStorage.getItem(legacyKey);
          if (value !== null) {
            localStorage.setItem(key, value);
            localStorage.removeItem(legacyKey);
          }
        }
        return value;
      } catch (error) {
        console.warn('No se pudo recuperar el carrito guardado:', error);
        return null;
      }
    },
    setItem(key, value) {
      localStorage.setItem(key, value);
      localStorage.removeItem(legacyKey);
    },
    removeItem(key) {
      localStorage.removeItem(key);
      localStorage.removeItem(legacyKey);
    },
  };
}
