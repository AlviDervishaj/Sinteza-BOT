import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";

// get adb devices
export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const cmd: ChildProcessWithoutNullStreams = spawn("adb devices", { shell: true });
    transferChildProcessOutput(cmd, res);
}