import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { log } from "node:console";
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { transferChildProcessOutput } from '../../utils/shell';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { username }: { username: string } = req.body;
    if (!username || username.trim() === "") {
        return res.end("[ERROR] Can not send status to telegram when username is not provided");
    }
    const _path: string = path.join(process.cwd(), 'scripts', 'send_data_to_telegram.py');
    const cmd: ChildProcessWithoutNullStreams = spawn(`python ${_path}`, { shell: true });
    log(`[INFO] Sending ${username}'s status to telegram ...`);
    cmd.stdin.write(username);
    cmd.stdin.end();
    transferChildProcessOutput(cmd, res);
}
