type ProgressCallback = (output: string) => void;

export const start_bot = async (
  username: string,
  onProgress: ProgressCallback
): Promise<string | false> => {
  const response: Response = await fetch(
    `/api/start_bot_checks?${new URLSearchParams({username: username})}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      },
    }
  )
  const reader = response.body?.getReader();
  if(reader) {
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
