import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { thoughts } = req.body;
  if (!thoughts || !thoughts.length) return res.status(400).json({ error: 'No thoughts provided' });

  try {
    const API_KEY = process.env.GIGACHAT_API_PERS;
    if (!API_KEY) return res.status(500).json({ error: 'API key missing' });

    const systemPrompt = `
Ты — квалифицированный психолог-аналитик. Тебе предоставлены короткие мысли человека...
(твой полный промт здесь)
`;

    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'GigaChat-2-Pro',       // выбираем модель
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: thoughts.join('\n') }
        ],
        n: 1
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message)
      return res.status(500).json({ error: 'Empty response from Gigachat' });

    res.status(200).json({ analysis: data.choices[0].message.content });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
}
