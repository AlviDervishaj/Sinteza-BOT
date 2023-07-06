export type ProcessProps = {
  device: string,
  user: {
    username: string,
    membership: "PREMIUM" | "FREE",
  },
  status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED",
  result: string,
};


export class Process {
  private _process: ProcessProps;

  constructor(device: string, username: string, membership: "PREMIUM" | "FREE", status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED", result: string) {
    this._process = {
      device, user: { username, membership }, status, result
    }
  }

  get device() {
    return this._process.device;
  }
  set device(device: string) {
    this._process.device = device;
    return;
  }

  get username() {
    return this._process.user.username;
  }
  set username(username: string) {
    this._process.user.username = username;
    return;
  }
  get membership() {
    return this._process.user.membership;
  }
  set membership(membership: "PREMIUM" | "FREE") {
    this._process.user.membership = membership;
    return;
  }


  get status() {
    return this._process.status;
  }
  set status(status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED") {
    this._process.status = status;
    return;
  }

  get result() {
    return this._process.result;
  }
  set result(result: string) {
    this._process.result = result;
    return;
  }
}

export class ProcessesPool {
  private _processes: Process[];

  constructor(processes: Process[] = []) {
    this._processes = processes;
  }

  get processes(): Process[] {
    return this._processes;
  }

  // remove first inserted
  removeFirstInsertedProcess(): void {
    this._processes.shift();
    return;
  }

  // remove a process based on device
  removeProcessByDevice(device: string): Process[] {
    const index = this._processes.findIndex(process => process.device === device);
    if (index > -1) {
      this._processes.splice(index, 1);
    }
    return this._processes;;
  }
  // remove process
  removeProcess(process: Process): Process[] {
    const index = this._processes.indexOf(process);
    if (index > -1) {
      this._processes.splice(index, 1);
    }
    return this._processes;
  }

  // remove a process by useranme and device
  removeProcessByUsernameAndDevice(username: string, device: string): Process[] {
    const index = this._processes.findIndex(process => process.device === device && process.username === username);
    if (index > -1) {
      this._processes.splice(index, 1);
    }
    return this._processes;
  }

  // remove last inserted
  removeLastInsertedProcess(): void {
    this._processes.pop();
    return;
  }

  // add to pool
  addToPool(process: Process): string | void {
    // check if process is already in pool
    const isProcessInPool = this._processes.find(_process => _process.device === process.device && _process.username === process.username);
    if (isProcessInPool) return "Process already in pool";

    this._processes.push(process);
    return;
  }

  // add to beginning of pool
  addToBeginningOfPool(process: Process): void {
    this._processes.unshift(process);
    return;
  }

  // find process by device
  findOneProcessByDevice(device: string): Process | undefined {
    return this._processes.find(process => process.device === device);
  }

  // find multiple processes by device
  findMultipleProcessesByDevice(device: string): Process[] {
    return this._processes.filter(process => process.device === device);
  }

  // find process by username
  findOneProcessByUsername(username: string): Process | undefined {
    return this._processes.find(process => process.username === username);
  }

  // find multiple processes by username
  findMultipleProcessesByUsername(username: string): Process[] {
    return this._processes.filter(process => process.username === username);
  }

  // find multiple processes by status
  findMultipleProcessesByStatus(status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED"): Process[] {
    return this._processes.filter(process => process.status === status);
  }

  // remove all
  removeAllProcesses(): void {
    this._processes = [];
    return;
  }

}

//   removeLastInsertedProcess() {
//     this._processes[this._processes.length - 1].cmd.kill("SIGINT");
//     const status = this._processes[this._processes.length - 1].cmd.killed;
//     this._processes.pop();
//     return status;
//   }

//   addToBeginningOfPool(process: Process) {
//     this._processes.unshift(process);
//     return;
//   }

//   removeFirstInsertedProcess() {
//     this._processes.shift();
//     return;
//   }
//   // find process by device
//   findOneProcessByDevice(device: string) {
//     return this._processes.find(process => process.config.device === device);
//   }

//   // find multiple processes by device
//   findMultipleProcessesByDevice(device: string) {
//     return this._processes.filter(process => process.config.device === device);
//   }

//   // find process by username
//   findOneProcessByUsername(username: string) {
//     console.log(this._processes);
//     return this._processes.find(process => process.config.username === username);
//   }

//   // find multiple processes by username
//   findMultipleProcessesByUsername(username: string) {
//     return this._processes.filter(process => process.config.username === username);
//   }

//   // find multiple processes by cmd
//   findMultipleProcessesByCmd(cmd: ChildProcessWithoutNullStreams) {
//     return this._processes.filter(process => process.cmd === cmd);
//   }

//   // find process by cmd
//   findOneProcessByCmd(cmd: ChildProcessWithoutNullStreams) {
//     return this._processes.find(process => process.cmd === cmd);
//   }

//   removeFromPool(process: Process) {
//     process.cmd.kill("SIGINT");
//     const index = this._processes.indexOf(process);
//     if (index > -1) {
//       this._processes.splice(index, 1)
//     }
//     else return index;
//   }

// }

// export class Process {
//   private _cmd: ChildProcessWithoutNullStreams;
//   private _config: BotFormData;


//   constructor(cmd: ChildProcessWithoutNullStreams, _config: BotFormData) {
//     this._cmd = cmd;
//     this._config = _config;
//   }

//   get config() {
//     return this._config;
//   }
//   set config(newConfig: BotFormData) {
//     this._config = newConfig;
//     return;
//   }

//   get cmd() {
//     return this._cmd;
//   }

// }


// export const ProcessesPool = new ProcessPool();

