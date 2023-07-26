import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { log } from "node:console";
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
        'accounts', username, 'config.yml')}`
    const command = process.env.SYSTEM === "linux" ? 'ps -aux | egrep' : 'tasklist | findstr /i';
    const pythonCommand =  process.env.SYSTEM === "linux" ? 'python' : 'python.exe'; 
    const cmd: ChildProcessWithoutNullStreams = spawn(`${command} "${pythonCommand} ${_path} ${spawnedArgs}" `, { shell: true });
    log(`[INFO] Getting pid for ${username} ...`);
    transferChildProcessOutput(cmd, res);
} 
