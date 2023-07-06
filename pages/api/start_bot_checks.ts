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
    res.status(400).json({ error: '[ERROR] Bot form data is not valid.' });
    return res.end();
  }
  if (typeof botFormData.username !== 'string' || botFormData.username.trim() === "") {
    res.status(400).json({ error: '[ERROR] Username is not valid.' });
    return res.end();
  }
  log('[INFO] Starting checks ...');
  log({ botFormData });
  const cmd = spawn('python3', [
    path.join(process.cwd(), 'scripts/start_bot_checks.py'),
    JSON.stringify(botFormData)
  ]);
  cmd.stdin.write(JSON.stringify(botFormData));
  cmd.stdin.end()
  transferChildProcessOutput(cmd, res);
}
