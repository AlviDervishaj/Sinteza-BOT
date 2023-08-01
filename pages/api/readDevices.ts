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
  const data = fs.readFileSync('devices.json', 'utf-8');
  const d: Devices = JSON.parse(data);
  return res.json(d);
}
