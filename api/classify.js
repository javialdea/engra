export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { image, mediaType, categories } = req.body ?? {};

  if (!image || !categories?.length) {
    res.status(400).json({ error: 'missing_fields' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'missing_api_key' });
    return;
  }

  const prompt = `Esta es una captura de pantalla de los movimientos de una tarjeta bancaria. Extrae cada movimiento de gasto que veas (ignora ingresos y saldos). Para cada uno, devuelve: concept (el comercio o descripción, limpio y corto), amount (número positivo, sin símbolo de moneda), date (si aparece, formato YYYY-MM-DD; si no lo sabes, omite el campo), y category (elige la que mejor encaje de esta lista exacta: ${categories.join(', ')}).

Responde SOLO con JSON válido, sin texto adicional, con esta forma:
{"transactions": [{"concept": "...", "amount": 12.34, "date": "2026-09-01", "category": "..."}]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: 'anthropic_error', detail });
      return;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    res.status(200).json({ transactions: parsed.transactions ?? [] });
  } catch {
    res.status(500).json({ error: 'server_error' });
  }
}
