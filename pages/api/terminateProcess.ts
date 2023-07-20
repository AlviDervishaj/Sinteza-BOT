import type { NextApiRequest, NextApiResponse } from 'next';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { log } from 'console';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const pid: string | null = req.query.pid as string;
  if (!pid) {
    res.end("[ERROR] Can not kill bot when pid is not provided");
    return;
  }
  else {
    log(`[INFO] Killing bot...`);
    // taskkill /F /PID
    const cmd: ChildProcessWithoutNullStreams = spawn(`kill -9 ${pid}`, { shell: true });
    log('[INFO] Killed bot');
    transferChildProcessOutput(cmd, res);
  }
}