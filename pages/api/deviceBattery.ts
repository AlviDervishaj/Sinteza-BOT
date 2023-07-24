import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { log } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { deviceId }: { deviceId: string } = req.body;
    if (!deviceId || deviceId.trim() === "") {
        res.end("[ERROR] Can not search for device when deviceId is not provided");
        return;
    }
    else {
        log(`[INFO] Getting device battery ...`);
        const command = `adb -s ${deviceId} shell dumpsys battery | find "level: "`;
        const cmd: ChildProcessWithoutNullStreams = spawn(command, { shell: true });
        transferChildProcessOutput(cmd, res);
    }


}