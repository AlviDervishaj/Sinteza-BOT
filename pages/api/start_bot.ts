import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import { transferChildOutputWithConditions } from '../../utils/shell';
import { log } from 'console';
import { BotFormData } from '../../utils/Types';

export default function POST(req: NextApiRequest, res: NextApiResponse) {

  const botFormData: BotFormData = req.body;

  // const botFormData: BotFormData = JSON.parse(decodeURIComponent(req.query.botData as string));
  if (typeof botFormData.username !== 'string' || botFormData.username.trim() === "") {
    res.status(400).json({ error: '[ERROR] Username is not valid.' });
    res.end();
    return;
  }
  log('[INFO] Starting Bot ...');
  const command: string = "python";
  const cmd: ChildProcessWithoutNullStreams = spawn(`${command} ${path.join(process.cwd(),
    'scripts', 'start_bot.py',)
    }`,
    { shell: true }
  );
  log("[INFO] Bot started successfully.")
  cmd.stdin.write(JSON.stringify({username: botFormData.username, config_name: botFormData.config_name ? botFormData.config_name : 'config.yml'}));
  cmd.stdin.end();
  transferChildOutputWithConditions(cmd, res);
}
