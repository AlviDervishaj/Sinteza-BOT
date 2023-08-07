import { Server, Socket } from "socket.io";

// convert to proper types !
export default function handler(_: any, res: any) {
  if (res.socket.server.io) {
    console.log("Server already started!");
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket_io",
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  const onConnection = (connection: Socket) => {
    console.log("New connection", connection.id);
    connection.on("createdMessage", (msg) => {
      console.log("New message", msg);
      connection.emit("newIncomingMessage", msg);
    });
  };

  io.on("connection", onConnection);

  console.log("Socket server started successfully!");
  res.end();
}
