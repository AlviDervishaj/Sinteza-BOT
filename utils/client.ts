import { URLcondition } from "./utils";

export const readData = async (url: string) => {
    const response = await fetch(`${URLcondition}${url}`);

    let reader = response.body?.getReader();
    if (!reader) {
        console.log("No reader");
        return;
    }
    let chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    console.log({ chunks: new TextDecoder().decode(...chunks) });
    return new TextDecoder().decode(...chunks);
}