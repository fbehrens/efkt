import WebSocket from "ws";

const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");

socket.onopen = function (_) {
  let subscriptionMessage = {
    Apikey: Deno.env.get("AISSTREAM_API_KEY")!,
    BoundingBoxes: [
      [
        [-180, -90],
        [180, 90],
      ],
    ],
  };
  socket.send(JSON.stringify(subscriptionMessage));
};

socket.onmessage = function (event) {
  console.log();
  console.log(event.data.toString());
  socket.close();
};
