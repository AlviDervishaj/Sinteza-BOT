import { BotFormData } from "./Types";
import { URLcondition } from "./utils";

type ProgressCallback = (output: string) => void;


// Start bot checks and stream output
export const start_bot_checks = async (
  botData: BotFormData,
  onProgress: ProgressCallback
): Promise<string | false> => {
  const response: Response = await fetch(`${URLcondition}api/start_bot_checks`, {
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
    `${URLcondition}api/start_bot`, {
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
