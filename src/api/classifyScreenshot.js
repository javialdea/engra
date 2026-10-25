// Cliente de la lectura de capturas por IA. La clave vive en el servidor (api/classify.js).

const MAX_SIDE = 1600;

/** Reduce la captura (JPEG, lado máximo 1600 px) para que viaje rápido y quepa en la petición. */
async function downscale(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
  return { base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' };
}

const CODE_KEY = 'engra-access-code';

/** El código de acceso vive solo en este dispositivo (no va en las copias de seguridad). */
export function getAccessCode() {
  try {
    return localStorage.getItem(CODE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveAccessCode(code) {
  try {
    localStorage.setItem(CODE_KEY, code.trim());
  } catch {
    // sin almacenamiento local, tendrá que escribirlo cada vez
  }
}

export async function classifyScreenshot(file, categories) {
  const { base64, mediaType } = await downscale(file);

  const res = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-engra-code': getAccessCode() },
    body: JSON.stringify({ image: base64, mediaType, categories: categories.map((c) => c.name) }),
  });

  if (!res.ok) {
    const error = new Error('classify_failed');
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return (data.transactions ?? []).map((t) => ({
    ...t,
    categoryId: categories.find((c) => c.name.toLowerCase() === String(t.category).toLowerCase())?.id ?? categories[0]?.id,
  }));
}
