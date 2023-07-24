import { ChildProcessWithoutNullStreams } from "node:child_process";
import { NextApiResponse } from "next";
import { throttle } from "./utils";

export function transferChildProcessOutputv2(cmd: ChildProcessWithoutNullStreams,
  res: NextApiResponse,
) {

  cmd.on('close', (code: number | null) => {
    console.log('[INFO] FINISHED.\nCODE : ', code)
  });
  let data: string;
  const throttledWrite = throttle(res.write, 10000);
  cmd.stderr.on('data', (chunk) => {
    const chunkString = chunk.toString('utf-8');
    data += chunkString;
    throttledWrite(data.split('\n')
      .map((line: string) => line)
      .join('\n'), 'utf-8')
  });

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    'Content-Encoding': 'none'
  });

  cmd.stdout.pipe(res);
}

export function transferChildProcessOutput(
  cmd: ChildProcessWithoutNullStreams,
  res: NextApiResponse,
) {

  cmd.on('close', (code: number | null) => {
    console.log('[INFO] FINISHED.\nCODE : ', code)
  });

  cmd.stderr.on('data', (chunk) => {
    const chunkString = chunk.toString('utf-8');
    res.write(chunkString.split('\n')
      .map((line: string) => line)
      .join('\n'))
  });

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    'Content-Encoding': 'none'
  });

  cmd.stdout.pipe(res);
}
