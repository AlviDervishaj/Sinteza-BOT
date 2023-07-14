// import { exec } from "child_process";
// import { NextApiRequest, NextApiResponse } from "next";

// // get adb devices
// export default async function GET(req: NextApiRequest, res: NextApiResponse) {
//     const bus_number: string = req.query.bus_number as string;
//     console.log({ bus_number });
//     if (bus_number.trim() === "") return;
//     const cmd = exec(`sudo lsusb -s ${bus_number} -v | grep -E 'idVendor|idProduct|iSerial'`).stdout?.pipe(res);
// }
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import { transferChildProcessOutput } from "../../utils/shell";

// get adb devices
export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const cmd: ChildProcessWithoutNullStreams = spawn("adb devices", { shell: true });
    transferChildProcessOutput(cmd, res);
}