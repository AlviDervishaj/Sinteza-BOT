import {ChildProcess} from "child_process";

type State = "RUNNING" | "WAITING" | "STOPPED";

export class ProcessPool {
  private _processes: Array<Process>;

  constructor(processes: Array<Process | []>) {
    this._processes = processes;
  }
  get processes(){
    return this._processes;
  }
  set processes(processes: Array<Process | null>) {
    this._processes = processes;
    return;
  }

  addToPool(process: Process){
    this._processes.push(process);
    return;
  }

  removeLastInsertedProcess(){
    this._processes.pop();
    return;
  }
  addToBeginningOfPool(process: Process){
    this._processes.unshift(process);
    return;
  }

  removeFirstInsertedProcess(){
    this._processes.shift();
    return;
  }

  removeFromPool(process: Process){
    const index = this._processes.indexOf(process);
    if(index > -1){
      this._processes.splice(index, 1)
    }
    else return index;
  }
}

export class Process {
  private _cmd: string;
  private _username: string;

  constructor(cmd: ChildProcess, username: string) {
    this._username = username;
    this._cmd = cmd;
  }

  get username(){
    return this._username;
  }
  set username(newUsername: string) {
    this._username = newUsername;
    return;
  }

  get cmd(){
    return this._cmd;
  }

  // run checks for this bot
  async runChecks(): Promise<any> {
    const response = await fetch(`/api/start_bot_checks?${new URLSearchParams({username: this.username})}`);
    return response.json();
  }

  // run this bot
  async startProcess(): Promise<any> {
    const response = await fetch(`/api/start_bot?${new URLSearchParams({username: this.username})}`);
    return response.json();
  }
}


export const ProcessesPool = new ProcessPool([]);

