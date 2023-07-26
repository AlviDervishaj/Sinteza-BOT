import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";
import path from "path";

// get adb devices
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { username }: { username: string } = req.body;
    if (username.trim() === "") {
        res.end("[ERROR] Username is not valid.");
        return;
    }
    const command: string ="python";
    const cmd: ChildProcessWithoutNullStreams = spawn(command,
        [path.join(process.cwd(), 'scripts', 'read_config.py')],
        { shell: true }
    );
    cmd.stdin.write(username);
    cmd.stdin.end();
    transferChildProcessOutput(cmd, res);
}
