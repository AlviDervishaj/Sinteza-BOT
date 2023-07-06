import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";
import path from 'path';
import { log } from "console";

// get adb devices
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { device }: { device: string } = req.body;
    const cmd: ChildProcessWithoutNullStreams = spawn(`python3 ${path.join(process.cwd(),
        'scripts/read_from_file.py',)
        }`,
        { shell: true }
    );
    log("[INFO] Reading from file for device : " + device);
    cmd.stdin.write(device);
    cmd.stdin.end();
    transferChildProcessOutput(cmd, res);
}