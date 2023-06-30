import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';
import { log } from 'console';

export default function GET(req: NextApiRequest, res: NextApiResponse) {
  const username: string = req.query.username as string;
  if (typeof username !== 'string' || username.trim() === "") {
    res.status(400).json({ error: '[ERROR] Username is not valid.' });
    return res.end();
  }
  log('[INFO] Starting checks ...');
  const cmd = spawn('python3', [
    path.join(process.cwd(), 'scripts/start_bot_checks.py'),
    username
  ]);
  cmd.stdin.write(username)
  cmd.stdin.end()
  transferChildProcessOutput(cmd, res);
}
