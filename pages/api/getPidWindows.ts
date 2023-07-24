import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { log } from "node:console";
import { GetSessionFromPython } from '../../utils/Types';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { username }: { username: string } = req.body;
    if (!username || username.trim() === "") {
        res.end("[ERROR] Can not get process when username is not provided");
        return;
    }
    const _path: string = path.join(process.cwd(), 'Bot', 'run.py');
    const spawnedArgs: string = `--config ${path.join(process.cwd(),
        'accounts', username, 'config.yml')}'`
    const cmd: ChildProcessWithoutNullStreams = spawn(`tasklist | findstr /i "python.exe ${_path} ${spawnedArgs}" `, { shell: true });
    log(`[INFO] Getting pid for ${username} ...`);
    transferChildProcessOutput(cmd, res);
} 