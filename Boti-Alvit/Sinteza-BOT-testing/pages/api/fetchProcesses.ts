import type { NextApiRequest, NextApiResponse } from 'next';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { log } from 'console';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const username: string | null = req.query.username as string;
    if (!username) {
        return res.end("[ERROR] Can not search for process when username is not provided");
    }
    else {
        log(`[INFO] Getting bots ...`);
        const cmd: ChildProcessWithoutNullStreams = spawn(`wsl ps -aux | wsl egrep 'python3 ${path.join(process.cwd(),
            'Bot', 'run.py')} --config ${path.join(process.cwd(),
                'Bot', 'accounts', username, 'config.yml')}'`, { shell: true });
        transferChildProcessOutput(cmd, res);
    }
}