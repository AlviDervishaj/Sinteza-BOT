import type { NextApiRequest, NextApiResponse } from 'next';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { log } from 'console';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const pid: string | null = req.query.pid as string;
  if (!pid) {
    return res.end("[ERROR] Can not kill bot when pid is not provided");
  }
  else {
    log(`[INFO] Killing bot...`);
    const cmd: ChildProcessWithoutNullStreams = spawn(`taskkill /F /PID  ${pid}`, { shell: true });
    log('[INFO] Killed bot');
    transferChildProcessOutput(cmd, res);
  }
}