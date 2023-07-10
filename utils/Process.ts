import { Session } from "./Types";

export type ProcessSkeleton = {
  _device: string,
  _result: string,
  _user: {
    username: string,
    membership: "PREMIUM" | "FREE",
  },
  _status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED",
  _total: Session[];
  _following: number;
  _followers: number;
  _session: string;

}
export class Process {
  private _device: string;
  private _result: string;
  private _total: Session[];
  private _followers: number;
  private _following: number;
  private _session: string;
  private _user: {
    username: string,
    membership: "PREMIUM" | "FREE",
  };
  private _status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED";



  constructor(device: string, username: string, membership: "PREMIUM" | "FREE", status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED", result: string, total: Session[], following: number, followers: number, session: string = "") {
    this._user = {
      username,
      membership
    }
    this._device = device;
    this._status = status;
    this._result = result;
    this._total = total;
    this._followers = followers;
    this._following = following;
    this._session = session;
  }

  get device() {
    return this._device;
  }
  set device(device: string) {
    this._device = device;
    return;
  }

  get session() {
    return this._session;
  }
  set session(session: string) {
    this._session = session;
    return;
  }

  get following() {
    return this._following;
  }
  set following(following: number) {
    this._following = following;
    return;
  }

  get followers() {
    return this._followers;
  }
  set followers(followers: number) {
    this._followers = followers;
    return;
  }

  get total() {
    return this._total;
  }
  set total(total: Session[]) {
    this._total = total;
    return;
  }
  get user() {
    return this._user;
  }
  set user(user: { username: string, membership: "PREMIUM" | "FREE" }) {
    this._user = user;
    return;
  }

  get username() {
    return this._user.username;
  }
  set username(username: string) {
    this._user.username = username;
    return;
  }

  get membership() {
    return this._user.membership;
  }
  set membership(membership: "PREMIUM" | "FREE") {
    this._user.membership = membership;
    return;
  }


  get status() {
    return this._status;
  }
  set status(status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED") {
    this._status = status;
    return;
  }

  get result() {
    return this._result;
  }
  set result(result: string) {
    this._result = result;
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
