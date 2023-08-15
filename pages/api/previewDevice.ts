import { spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";

// get adb devices
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { deviceId }: { deviceId: string } = req.body;
  spawn(`scrcpy -s ${deviceId}`, { shell: true });
  res.end();
  return;
}
