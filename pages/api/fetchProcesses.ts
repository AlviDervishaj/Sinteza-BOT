import type { NextApiRequest, NextApiResponse } from 'next';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { log } from 'console';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const username: string | null = req.query.username as string;
    if (!username) {
        res.end("[ERROR] Can not search for process when username is not provided");
        return;
    }
    else {
        log(`[INFO] Getting bots ...`);
        const command: string = process.env.SYSTEM === "linux" ? "ps -aux | egrep 'python" : "WMIC path win32_process get Caption,Processid,Commandlin | find 'python";
        const cmd: ChildProcessWithoutNullStreams = spawn(`${command} ${path.join(process.cwd(),
            'Bot', 'run.py')} --config ${path.join(process.cwd(),
                'accounts', username, 'config.yml')}'`, { shell: true });
        transferChildProcessOutput(cmd, res);
    }
}
