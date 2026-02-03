import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { thoughts } = req.body;
  if (!thoughts || !thoughts.length) return res.status(400).json({ error: 'No thoughts provided' });

  try {
    // -------------------- ВАЖНО --------------------
    // Используем Environment Variable, которую ты создал
    // Key: GIGACHAT_API_PERS
    // Value: твой API ключ Gigachat
    const API_KEY = process.env.GIGACHAT_API_PERS;

    const systemPrompt = `
Ты — квалифицированный психолог-аналитик. Тебе предоставлены короткие мысли человека, записанные в случайные моменты дня. Эти записи отражают текущие ощущения, размышления и наблюдения автора о себе и своём поведении.

Твоя задача — **провести холодный аналитический разбор этих мыслей**:
- выявить повторяющиеся темы или паттерны;
- заметить явные зацикленности или ригидные мысли;
- описать ключевые эмоциональные и когнитивные тенденции, присутствующие в текстах;
- учитывать, что тексты ситуативные, быстрые, не структурированные, могут быть фрагментарными.

**Важно:**
- не давать советы и не предлагать действия;
- не делать интерпретаций, связанных с личностью автора;
- не использовать эмоциональные оценки типа “хорошо/плохо”;
- фокусироваться на фактах из текста, паттернах и наблюдаемых тенденциях.

Дай результат в виде чёткого структурного анализа мыслей, перечисляя выявленные темы, повторения, зацикленности и особенности мышления.
`;

    const response = await fetch('https://api.gigachat.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`, // <-- теперь используется GIGACHAT_API_PERS
      },
      body: JSON.stringify({
        model: 'gigachat-standard',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: thoughts.join('\n') }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Empty response from Gigachat' });
    }

    res.status(200).json({ analysis: data.choices[0].message.content });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
}
