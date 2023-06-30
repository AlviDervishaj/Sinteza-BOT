import type { NextApiRequest, NextApiResponse } from 'next';
import { exec, spawn } from 'child_process';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';
import { log } from 'console';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const username: string | null = req.query.username;
  if (!username) {
    return res.end("[ERROR] Can not end process when username is not provided");
  }
  else {
    log(`[INFO] Getting pid of process...`);
    const cmd = exec(`ps -aux | egrep 'python3 start_bot.py'`);
    log(`[INFO] Terminating process that is running for : ${username}`);
    transferChildProcessOutput(cmd, res);
  }
}
