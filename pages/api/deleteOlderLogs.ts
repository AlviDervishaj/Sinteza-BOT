import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { readFile, writeFile } from "node:fs";
import path from "node:path";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { username }: { username: string } = req.body;
    const month: string = dayjs().format("MM");
    const date: string = dayjs().format("DD");
    const format: string = `[${month}/${date}`;
    const _logPath: string = path.join(process.cwd(), 'logs', `${username}.log`)
    // read username.log file
    try {
        readFile(_logPath, "utf8", (err, data) => {
            const lines = data.split("\n");
            let rewrite = lines.map((line: string) => {
                return line.startsWith(format) ? line : null;
            }).filter((l: string | null) => l !== null);
            // // write new content to file
            writeFile(_logPath, rewrite.length > 0 ? rewrite.join("\n") : "", (err) => {
                if (err) {
                    console.log({ err });
                    res.end("Error updating log file.");
                    return;
                }
                else {
                    res.end("Log file updated.");
                    return;
                };
            });
        });
    }
    catch (err) {
        console.log(err);
        res.end("No Log file.");
        return;
    }
}