import {
    JoinWorldPacketSerializer,
    PositionUpdatePacketSerializer,
    ServerCommandPacketSerializer,
    SpawnEntityPacketSerializer,
} from "@mmotest/network";
import {Game} from "./Game";

export class GameNetwork {
    ws: WebSocket | null = null;

    constructor(private game: Game) {}

    SendServerCommand(cmd: string) {
        if (this.ws) {
            this.ws.send(
                ServerCommandPacketSerializer.toBytes({
                    opCode: 0x20,
                    command: cmd,
                })
            );
        }
    }

    OnInit(ws: WebSocket) {
        this.ws = ws;
        if (this.ws) {
            ws.send(
                JoinWorldPacketSerializer.toBytes({
                    opCode: 0x01,
                    accountId: 1,
                })
            );
        }
    }

    OnPacketReceived(arrayBuffer: ArrayBuffer) {
        const buff = new Uint8Array(arrayBuffer);
        const opCode = buff[0];
        switch (opCode) {
            case 0x01: {
                const pack = JoinWorldPacketSerializer.fromBytes(buff);
                console.log(`got join packet ${pack.accountId}`);
                break;
            }
            case 0x10: {
                const pack = SpawnEntityPacketSerializer.fromBytes(buff);
                this.game.Spawn(pack);
                break;
            }
            case 0x11: {
                const pack = PositionUpdatePacketSerializer.fromBytes(buff);
                const entity = this.game.entities.find((x) => x.id === pack.entityId);
                if (entity) {
                    entity.transform.position.x = pack.position.x;
                    entity.transform.position.y = pack.position.y;
                    entity.transform.position.z = pack.position.z;
                }
                break;
            }
        }
        console.log(`got packet ${opCode}`);
    }
}
