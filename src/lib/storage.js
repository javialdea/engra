// Almacenamiento protegido: pide al navegador que no borre los datos por su cuenta.

/** Lo pide una vez al arrancar. Chrome lo concede según el uso; Safari, si la app está instalada. */
export async function requestPersistence() {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    // navegador sin soporte: seguimos sin protección extra
  }
  return false;
}

export async function isPersisted() {
  try {
    return (await navigator.storage?.persisted?.()) ?? false;
  } catch {
    return false;
  }
}
