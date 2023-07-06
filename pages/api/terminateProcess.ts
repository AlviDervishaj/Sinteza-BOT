import type { NextApiRequest, NextApiResponse } from 'next';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { log } from 'console';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const username: string | null = req.query.username as string;
  if (!username) {
    return res.end("[ERROR] Can not end process when username is not provided");
  }
  else {
    log(`[INFO] Getting pid of process...`);
    const cmd: ChildProcessWithoutNullStreams = spawn(`ps -aux | egrep 'python3 ${path.join(process.cwd(),
      'Bot/run.py')} --config ${path.join(process.cwd(),
        'Bot', 'accounts', username, 'config.yml')}'`, { shell: true });
    log(`[INFO] Terminating process that is running for : ${username} `);
    log(`PATH: ${path.join(process.cwd(),
      'Bot/run.py')} --config ${path.join(process.cwd(),
        'Bot', 'accounts', username, 'config.yml')}`)
    transferChildProcessOutput(cmd, res);
  }
}