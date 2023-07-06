import { BotFormData } from "./Types";

type ProgressCallback = (output: string) => void;

const condition =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/"
    : "https://sinteza.vercel.app/";

// Start bot checks and stream output
export const start_bot_checks = async (
  botData: BotFormData,
  onProgress: ProgressCallback
): Promise<string | false> => {
  const response: Response = await fetch(`${condition}api/start_bot_checks`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(botData),
  }
  )
  const reader = response.body?.getReader();
  if (reader) {
    const result = await streamResponse(reader, onProgress);
    return result.split('\n').filter((line) => {
      return !line.startsWith('[Error]')
    }).join('\n')
  }
  else return false;
}
// Start bot and stream output
export const start_bot = async (
  botData: BotFormData,
  onProgress: ProgressCallback
): Promise<string | false> => {
  const response: Response = await fetch(
    `${condition}api/start_bot`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(botData),
  });

  const reader = response.body?.getReader();
  if (reader) {
    const result = await streamResponse(reader, onProgress);
    return result.split('\n').filter((line) => {
      return !line.startsWith('[Error]')
    }).join('\n')
  }
  else return false;
}

export const readFromFile = async (device: string, onProgress: ProgressCallback) => {
  const response: Response = await fetch(
    `${condition}api/read_from_file`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device }),
  });
  const reader = response.body?.getReader();
  if (reader) {
    const result = await streamResponse(reader, onProgress);
    return result.split('\n').filter((line) => {
      return !line.startsWith('[Error]')
    }).join('\n')
  }
}

export const writeToFile = async ({ text, device }: { text: string, device: string }) => {
  const response: Response = await fetch(
    `${condition}api/write_to_file`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, device }),
  });
  const data: { info: string, error?: string, code: number } = await response.json();
  return data;
}

// Stream response chunk by chunk
export const streamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onProgress: (output: string) => void,
): Promise<string> => {
  return new Promise((resolve) => {
    const decoder: TextDecoder = new TextDecoder();
    let result = '';
    const readChunk = ({
      done,
      value
    }: ReadableStreamReadResult<Uint8Array>) => {
      if (done) {
        resolve(result);
        return;
      }
      const output = decoder.decode(value);
      result += output;
      onProgress(output);
      reader.read().then(readChunk);
    }
    reader.read().then(readChunk);
  });
}
