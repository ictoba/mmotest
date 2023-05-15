import {Entity} from "@mmotest/ecs";
import {createId} from "@paralleldrive/cuid2";
import {App, DEDICATED_COMPRESSOR_3KB, us_listen_socket, us_listen_socket_close} from "uWebSockets.js";
import {NetworkClient, SocketInfo} from "./NetworkClient";
import { World } from "./World";

export class NetworkManager {
    listenSocket: us_listen_socket | null = null;
    clientsMap = new Map<string, NetworkClient>();

    world: WeakRef<World>;

    constructor(world: World) {
        this.world = new WeakRef(world);
    }

    get World(): World {
        return this.world.deref();
    }

    Init(port: number) {
        const app = App({});

        app.ws<SocketInfo>("/*", {
            idleTimeout: 32,
            maxBackpressure: 1024,
            maxPayloadLength: 512,
            compression: DEDICATED_COMPRESSOR_3KB,

            message: (ws, msg, isBinary) => {
                const client = this.clientsMap.get(ws.getUserData().id);
                if (client) {
                    client.OnPacketReceived(msg, isBinary);
                }
            },
            close: (ws, code, msg) => {
                console.log(`Socket closed ${ws.getUserData().id} - ${code}`);
                const client = this.clientsMap.get(ws.getUserData().id);
                if (client) {
                    client.OnDisconnect(msg);
                    this.clientsMap.delete(client.id);
                }
            },
            open: (ws) => {
                const id = createId();
                ws.getUserData().id = id;
                this.clientsMap.set(id, new NetworkClient(id, ws, this.World));
                const addrBuff = Buffer.from(ws.getRemoteAddressAsText());
                console.log(`New connection from ${addrBuff.toString()}`);
            },
        });

        app.get("/*", (res, _) => {
            res.writeStatus("200 OK").end("Server up and running");
        });

        app.listen(port, (sock) => {
            if (sock) {
                this.listenSocket = sock;
                console.log(`Listening to port ${port}`);
            }
        });
    }

    Update() {
    }

    Dispose() {
        if (this.listenSocket) {
            us_listen_socket_close(this.listenSocket);
        }
    }
}
