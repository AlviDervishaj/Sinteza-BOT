import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { log } from "node:console";
import { GetSessionFromPython } from '../../utils/Types';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const data = req.body as GetSessionFromPython;
    if (!data.username || data.username.trim() === "") {
        res.end("[ERROR] Can not read file when username is not provided");
        return;
    }
    const _path: string = path.join(process.cwd(), 'scripts', 'sessions.py');
    const command: string = process.env.SYSTEM === "linux" ? "python3" : "python";
    const cmd: ChildProcessWithoutNullStreams = spawn(`${command} ${_path}`, { shell: true });
    log(`[INFO] Getting session for ${data.username} ...`);
    cmd.stdin.write(JSON.stringify(data));
    cmd.stdin.end();
    transferChildProcessOutput(cmd, res);
} 
