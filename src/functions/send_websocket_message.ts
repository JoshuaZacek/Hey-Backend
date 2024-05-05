import { websockets } from "../index.js";

export default async function send_websocket_message(
  user_id: string,
  event: string,
  data: unknown
) {
  const receiver_websockets = websockets.get(user_id);

  for (const i in receiver_websockets) {
    receiver_websockets[i].send(JSON.stringify({ event, data }));
  }
}
