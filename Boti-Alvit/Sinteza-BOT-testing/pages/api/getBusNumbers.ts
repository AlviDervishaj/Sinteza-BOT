import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import path from 'node:path';
import { transferChildProcessOutput } from "../../utils/shell";

// get adb devices
export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const _path: string = path.join(process.cwd(), 'scripts', 'get_bus_numbers.sh');
    const cmd: ChildProcessWithoutNullStreams = spawn(_path, { shell: true });
    transferChildProcessOutput(cmd, res);
}