import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";

// get adb devices
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { deviceId }: { deviceId: string } = req.body;
    const cmd: ChildProcessWithoutNullStreams = spawn(`scrcpy -s ${deviceId}`, { shell: true });
    transferChildProcessOutput(cmd, res);
}