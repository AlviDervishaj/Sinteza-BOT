import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';
import { log } from 'console';
import { BotFormData } from '../../utils/Types';

export default function POST(req: NextApiRequest, res: NextApiResponse) {

  const botFormData: BotFormData = req.body;
  if (typeof botFormData.username !== 'string' || botFormData.username.trim() === "") {
    res.status(400).json({ error: '[ERROR] Username is not valid.' });
    return res.end();
  }
  log('[INFO] Starting Bot ...');
  const cmd: ChildProcessWithoutNullStreams = spawn(`python ${path.join(process.cwd(),
    'scripts', 'start_bot.py',)
    }`,
    { shell: true }
  );
  log("[INFO] Bot started successfully.")
  cmd.stdin.write(botFormData.username);
  cmd.stdin.end();
  transferChildProcessOutput(cmd, res);
}
