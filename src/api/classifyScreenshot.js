export async function classifyScreenshot(file, categories) {
  const imageBase64 = await fileToBase64(file);

  const res = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageBase64,
      mediaType: file.type,
      categories: categories.map((c) => c.name),
    }),
  });

  if (!res.ok) {
    throw new Error('classify_failed');
  }

  const data = await res.json();
  return data.transactions.map((t) => ({
    ...t,
    categoryId: categories.find((c) => c.name === t.category)?.id ?? categories[0]?.id,
  }));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
