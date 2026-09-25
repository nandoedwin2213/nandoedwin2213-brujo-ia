import { Env } from '@/libs/Env';

const VENICE_API = 'https://api.venice.ai/api/v1';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Env.VENICE_API_KEY}`,
});

export const generateText = async (prompt: string): Promise<string> => {
  const res = await fetch(`${VENICE_API}/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: Env.VENICE_MODEL,
      messages: [{ role: 'user', content: prompt }],
      venice_parameters: { include_venice_system_prompt: false },
    }),
  });

  if (!res.ok) {
    throw new Error(`Venice chat failed (${res.status}): ${await res.text()}`);
  }

  const data: { choices?: { message?: { content?: string } }[] } = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Venice returned an empty response');
  }

  return content;
};

/** Returns a PNG data URL. */
export const generateImage = async (prompt: string): Promise<string> => {
  const res = await fetch(`${VENICE_API}/image/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: Env.VENICE_IMAGE_MODEL,
      prompt,
      width: 1024,
      height: 1024,
      format: 'png',
      safe_mode: false,
      hide_watermark: true,
      return_binary: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Venice image failed (${res.status}): ${await res.text()}`);
  }

  const data: { images?: string[] } = await res.json();
  const image = data.images?.[0];

  if (!image) {
    throw new Error('Venice returned no image');
  }

  return `data:image/png;base64,${image}`;
};
