import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';
import { log } from 'console';
import { BotFormData } from '../../utils/Types';

export default function GET(req: NextApiRequest, res: NextApiResponse) {
  const botFormData: BotFormData = req.body;
  // check if data is valid
  if (!botFormData) {
    return res.end('[ERROR] Bot form data is not valid.');
  }
  if (typeof botFormData.username !== 'string' || botFormData.username.trim() === "") {
    return res.end('[ERROR] Username is not valid.');
  }
  log('[INFO] Starting checks ...');
  const cmd = spawn('python', [
    path.join(process.cwd(), 'scripts/start_bot_checks.py'),
    JSON.stringify(botFormData)
  ]);
  cmd.stdin.write(JSON.stringify(botFormData));
  cmd.stdin.end()
  transferChildProcessOutput(cmd, res);
}
