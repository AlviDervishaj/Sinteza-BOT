import type { NextApiRequest, NextApiResponse } from 'next';
import { exec, spawn } from 'child_process';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';
import { log } from 'console';

export default function GET(req: NextApiRequest, res: NextApiResponse) {
  const username: string | null = req.query.username;
  if (!username) {
    log(`[INFO] Getting all bots ...`);
    const cmd = exec("ps -aux | egrep 'python3 start_bot.py'");
    transferChildProcessOutput(cmd, res);
  }
  else {
    log(`[INFO] Getting ${username} bot ...`);
    const cmd = exec(`ps -aux | egrep 'python3 start_bot.py ${username}'`);
    transferChildProcessOutput(cmd, res);
  }
}
