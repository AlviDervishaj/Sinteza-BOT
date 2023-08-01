import type { NextApiRequest, NextApiResponse } from 'next';
import fs from "node:fs";
import { ProcessSkeleton } from '../../utils';

type Devices = {
  id: string,
  name: string,
  process: null | ProcessSkeleton,
  battery: 'X' | string;
}[];

export default async function POST(req: NextApiRequest, res: NextApiResponse<Devices>) {
  const devices: Devices = req.body;
  const data: string = JSON.stringify(devices);

  fs.writeFileSync('devices.json', data);
  res.end();
  return;
}
