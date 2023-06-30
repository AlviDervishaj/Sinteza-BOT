import {FC, useState, useCallback} from "react";
import {Output} from "../components/Output";

export const UsernameInput: FC<Props> = () => {
  const [alreadyCalled, setAlreadyCalled] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<string>("");
  const displayError = (error: string) => {
      return setError((prevError) => prevError + `${error}\n`);
  }
  const logData = (data: string) => {
      return setData((prevData) => prevData + `${data}\n`);
  }
  const callApi = async () => {
    setAlreadyCalled(true);
    const condition = process.env.NODE_ENV === "development" ? "http://localhost:3000/" : "https://sinteza.vercel.app/";
    logData("[INFO] Checking if another process is currently running ...");
    const isAnotherProcessRunning = await fetch(`${condition}api/fetchProcesses?${new URLSearchParams({username: username})}`)
    const process = await isAnotherProcessRunning.text();
    if(process.toString().includes(`python3 start_bot.py ${username}`)){
      displayError(`A bot is already running on this user : ${username}`);
      displayError(`Terminating process`);
      const result = await fetch(`${condition}api/terminateProcess?${new URLSearchParams({username: username})}`)
      const terminatedData = await result.text();
      // error occurred
      if(terminatedData.includes("[ERROR]")){
          const _error: Array<string> = terminatedData.split("[ERROR]");
          displayError(_error[1].trim());
          setAlreadyCalled(false);
        }
      // terminated process
      else {
        displayError("Process terminated");
      }
    }
    logData(process);
    //logData("[INFO] Running checks ...");
    //const result = await fetch(`${condition}api/start_bot_checks?${new URLSearchParams({username: username})}`)
    //const data:string = await result.text();
    //// format data
    //logData(data);
    //logData("[INFO] Starting bot ...");
  };
  return (
  <>
    <section className="grid grid-rows-2 lg:grid-rows-1 gap-8">
      <input
        type="text"
        id="username"
        name="username"
        required
        value={username}
        autofill="no"
        className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-300 "
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Enter username"
      />
      <button
      disabled={alreadyCalled}
      onClick={() => callApi()}
      className="w-fit h-fit px-4 py-2 border border-solid border-slate-600 rounded-lg hover:bg-slate-400">
        Start Bot
      </button>
   </section>
    <Output data={data} error={error}/>
   </>
  )
}
