import type { NextApiRequest, NextApiResponse } from 'next';
import { exec, spawn } from 'child_process';
import path from 'path';
import { transferChildProcessOutput } from '../../utils/shell';
import { log } from 'console';

export default function GET(req: NextApiRequest, res: NextApiResponse) {
    const username: string = req.query.username as string;
    if (!username) {
        log(`[INFO] Getting all bots ...`);
        const cmd = spawn("ps -aux | egrep 'python3 start_bot.py'", { shell: true });
        transferChildProcessOutput(cmd, res);
    }
    else {
        log(`[INFO] Getting ${username} bot ...`);
        const cmd = spawn(`ps -aux | egrep 'python3 start_bot.py ${username}'`, { shell: true });
        transferChildProcessOutput(cmd, res);
    }
}