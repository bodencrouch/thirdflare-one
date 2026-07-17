import { connect } from "node:net";

const host = process.argv[2] || "127.0.0.1";
const port = Number(process.argv[3] || 4173);

const socket = connect({ host, port, timeout: 700 });

socket.on("connect", () => {
  socket.destroy();
  process.exit(0);
});

socket.on("timeout", () => {
  socket.destroy();
  process.exit(1);
});

socket.on("error", () => {
  process.exit(1);
});
