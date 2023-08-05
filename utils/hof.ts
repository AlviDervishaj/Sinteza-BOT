import { io, Socket } from "socket.io-client";

// handle scoket connections here
export function socketWrapper<T extends unknown[]>(actionFunction: (...args: T) => void) {
  // open connection
  const socket: Socket = io("ws://localhost:3030", { autoConnect: false });

  return (...args: T) => {
    actionFunction(...args)
    // close connection.
    socket.emit("close");
    socket.close();
  };
}
