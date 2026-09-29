/** xAI Responses API. Used by the mention bot. */

const XAI = 'https://api.x.ai/v1/responses';
const MODEL = process.env.XAI_MODEL || 'grok-4.6';

export function getXaiKey() {
  const key = process.env.XAI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error('Set XAI_API_KEY for Discord mention replies.');
  }
  return key.trim();
}

function textFromResponse(data) {
  if (data && typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const output = Array.isArray(data?.output) ? data.output : [];
  const chunks = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === 'string') chunks.push(part.text);
    }
  }
  const joined = chunks.join('\n').trim();
  if (!joined) throw new Error('xAI returned no text.');
  return joined;
}

export async function askGrok(prompt) {
  const res = await fetch(XAI, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getXaiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: prompt,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && typeof data.error === 'object'
        ? data.error.message
        : JSON.stringify(data);
    throw new Error(`xAI ${res.status}: ${message}`);
  }
  return textFromResponse(data);
}

export function splitDiscord(text) {
  const limit = 1900;
  if (text.length <= limit) return [text];
  const parts = [];
  let rest = text;
  while (rest.length > limit) {
    let cut = rest.lastIndexOf('\n', limit);
    if (cut < 200) cut = limit;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  if (rest) parts.push(rest);
  return parts;
}
