import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";
import path from 'path';
import { log } from "console";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { text, deviceId }: { text: string, deviceId: string } = req.body;
    const cmd: ChildProcessWithoutNullStreams = spawn(`python3 ${path.join(process.cwd(),
        'scripts/write_to_file.py',)
        }`,
        { shell: true }
    );
    log("[INFO] Writing to file for device : " + deviceId);
    cmd.stdin.write(JSON.stringify({ logs: text, device: deviceId }));
    cmd.stdin.end();
    transferChildProcessOutput(cmd, res);
}