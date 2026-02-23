export interface ChatResponse {
  answer: string;
  conversation_id: string;
  message_id: string;
}

export async function uploadAndSolve(blob: Blob, filename: string): Promise<ChatResponse> {
  const formData = new FormData();
  formData.append('file', blob, filename);

  const res = await fetch('/api/solve', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`解答の取得に失敗しました (${res.status}): ${text}`);
  }

  return res.json() as Promise<ChatResponse>;
}

export async function sendChatMessage({
  query,
  conversationId,
}: {
  query: string;
  conversationId?: string;
}): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, conversation_id: conversationId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`APIリクエスト失敗 (${res.status}): ${text}`);
  }

  return res.json() as Promise<ChatResponse>;
}

export function dataURLtoBlob(dataURL: string): Blob {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)![1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
