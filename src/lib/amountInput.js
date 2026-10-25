// Teclado numérico propio: el importe se escribe como texto ('12,5') y se valida tecla a tecla.

export function pressKey(value, key) {
  if (key === 'back') return value.slice(0, -1);

  if (key === ',') {
    if (value.includes(',')) return value;
    return value === '' ? '0,' : `${value},`;
  }

  if (!/^\d$/.test(key)) return value;

  if (value.includes(',')) {
    const dec = value.split(',')[1] ?? '';
    return dec.length >= 2 ? value : value + key;
  }
  if (value === '0') return key === '0' ? value : key;
  if (value.length >= 7) return value;
  return value + key;
}

/** '1234,5' -> '1.234,5' (solo para mostrar). */
export function displayAmount(value) {
  if (!value) return '0';
  const [int, dec] = value.split(',');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec === undefined ? grouped : `${grouped},${dec}`;
}

export const amountToText = (n) => String(n).replace('.', ',');
