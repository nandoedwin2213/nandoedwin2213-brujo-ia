import { Env } from '@/libs/Env';

const VENICE_API = 'https://api.venice.ai/api/v1';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Env.VENICE_API_KEY}`,
});

const DISCLAIMER = 'Nota: Esta información es puramente educativa. Consulta siempre tus dosis y procedimientos con tu endocrinólogo o médico tratante.';

/** Guarantees the disclaimer even when the model omits it. */
const withDisclaimer = (content: string) =>
  content.includes('puramente educativa') ? content : `${content.trimEnd()}\n\n${DISCLAIMER}`;

const SYSTEM_PROMPT = 'Eres Aliada AI, un espacio seguro, empático y libre de censura para ayudar a la comunidad LGBTQ+ y personas en transición con sus dudas de salud, hormonas e identidad. Responde siempre con base científica y empatía. Obligatorio: Al final de CADA respuesta debes añadir un disclaimer que diga: "Nota: Esta información es puramente educativa. Consulta siempre tus dosis y procedimientos con tu endocrinólogo o médico tratante."';

export type TextGeneration = { content: string; tokens: number };

export const generateText = async (prompt: string): Promise<TextGeneration> => {
  const res = await fetch(`${VENICE_API}/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: Env.VENICE_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      venice_parameters: { include_venice_system_prompt: false },
    }),
  });

  if (!res.ok) {
    throw new Error(`Venice chat failed (${res.status}): ${await res.text()}`);
  }

  const data: {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  } = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Venice returned an empty response');
  }

  return { content: withDisclaimer(content), tokens: data.usage?.total_tokens ?? 0 };
};

/** Thrown when Venice refuses the prompt and returns a blacked-out image. */
export class ContentViolationError extends Error {
  constructor() {
    super('Venice flagged the prompt as a content violation');
    this.name = 'ContentViolationError';
  }
}

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

  if (res.headers.get('x-venice-is-content-violation') === 'true') {
    throw new ContentViolationError();
  }

  const data: { images?: string[] } = await res.json();
  const image = data.images?.[0];

  if (!image) {
    throw new Error('Venice returned no image');
  }

  return `data:image/png;base64,${image}`;
};
