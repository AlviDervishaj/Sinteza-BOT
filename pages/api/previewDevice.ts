import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";
import path from "path";

// get adb devices
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { deviceId }: { deviceId: string } = req.body;
    const _command: string = path.join(process.cwd(), 'scrcpy', 'scrcpy.exe');
    const cmd: ChildProcessWithoutNullStreams = spawn(`${_command} -s ${deviceId}`, { shell: true });
    transferChildProcessOutput(cmd, res);
}