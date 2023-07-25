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
    res.end('[ERROR] Bot form data is not valid.');
    return;
  }
  if (typeof botFormData.username !== 'string' || botFormData.username.trim() === "") {
    res.end('[ERROR] Username is not valid.');
    return;
  }
  log('[INFO] Starting checks ...');
  const command: string = process.env.SYSTEM === "linux" ? "python3" : "python";
  const cmd = spawn(command,
    [path.join(process.cwd(), 'scripts', 'start_bot_checks.py')],
    { shell: true });
  cmd.stdin.write(JSON.stringify({ ...botFormData, device: botFormData.device.id }));
  cmd.stdin.end()
  transferChildProcessOutput(cmd, res);
}
