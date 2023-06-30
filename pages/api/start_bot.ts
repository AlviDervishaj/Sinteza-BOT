import type { NextApiRequest, NextApiResponse } from 'next';
import { exec, ChildProcess } from 'child_process';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';
import { log } from 'console';
import {Process, ProcessesPool} from "../../utils/Process";

export default function GET(req: NextApiRequest, res: NextApiResponse) {
  const username: string = req.query.username as string;
  if (typeof username !== 'string' || username.trim() === "") {
    res.status(400).json({ error: '[ERROR] Username is not valid.' });
    return res.end();
  }
  log('[INFO] Starting Bot ...');
  const cmd = exec(`python3 ${path.join(process.cwd(), 'scripts/start_bot.py')} ${username}`)
  const p = new Process(cmd, username);
  ProcessesPool.addToPool(p);
  cmd.stdin.write(username)
  cmd.stdin.end()
  transferChildProcessOutput(cmd, res);
}
