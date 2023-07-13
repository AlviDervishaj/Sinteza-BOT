import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { log } from "node:console";
import { GetSessionFromPython } from '../../utils/Types';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const username = req.query.username as string;
    if (!username || username.trim() === "") {
        return res.end("[ERROR] Can not read file when username is not provided");
    }
    const _path: string = path.join(process.cwd(), 'scripts/get_config.py');
    const cmd: ChildProcessWithoutNullStreams = spawn(`python ${_path}`, { shell: true });
    log(`[INFO] Getting config for ${username} ...`);
    cmd.stdin.write(username);
    cmd.stdin.end();
    transferChildProcessOutput(cmd, res);
} 
