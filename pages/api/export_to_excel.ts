import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { Process } from '../../utils/Process';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { data }: { data: Process[] } = req.body;
    if (!data || data.length === 0) {
        return res.end("[ERROR] Nothing to export to excel");
    }
    const _path: string = path.join(process.cwd(), 'scripts/export_to_excel.py');
    const cmd: ChildProcessWithoutNullStreams = spawn(`python3 ${_path}`, { shell: true });
    cmd.stdin.write(JSON.stringify(data));
    cmd.stdin.end();
} 
