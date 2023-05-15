import {Entity} from "@mmotest/ecs";
import {PositionUpdatePacket, PositionUpdatePacketSerializer, ServerCommandPacketSerializer, SpawnEntityPacket, SpawnEntityPacketSerializer} from "@mmotest/network";
import {WebSocket} from "uWebSockets.js";
import {World} from "./World";

export type SocketInfo = {
    id: string;
};

export class NetworkClient {
    world: WeakRef<World>;

    constructor(public readonly id: string, private readonly socket: WebSocket<SocketInfo>, world: World) {
        this.world = new WeakRef(world);
    }

    get World(): World {
        return this.world.deref();
    }

    UpdatePosition(entity: Entity) {
        const pack: PositionUpdatePacket = {
            entityId: entity.id,
            opCode: 0x11,
            position: {
                x: entity.transform.position.x,
                y: entity.transform.position.y,
                z: entity.transform.position.z,
            },
        };
        const buff = PositionUpdatePacketSerializer.toBytes(pack);
        this.socket.send(buff, true);
    }

    SpawnEntity(entity: Entity) {
        const pack: SpawnEntityPacket = {
            opCode: 0x10,
            entity: {
                id: entity.id,
                position: {
                    x: entity.transform.position.x,
                    y: entity.transform.position.y,
                    z: entity.transform.position.z,
                },
                rotation: {
                    x: entity.transform.rotation.x,
                    y: entity.transform.rotation.y,
                    z: entity.transform.rotation.z,
                },
                scale: {
                    x: entity.transform.scale.x,
                    y: entity.transform.scale.y,
                    z: entity.transform.scale.z,
                },
            },
        };
        const buff = SpawnEntityPacketSerializer.toBytes(pack);
        this.socket.send(buff, true);
    }

    SendPacket(packet: Uint8Array) {
        this.socket.send(packet, true);
    }

    OnPacketReceived(msg: ArrayBuffer, isBinary: boolean) {
        console.log(`got message!`);
        if (isBinary) {
            const buff = new Uint8Array(msg);
            if (buff[0] === 0x20) {
                const pack = ServerCommandPacketSerializer.fromBytes(buff);
                if (pack.command === "spawn") {
                    console.log(`got spawn command`);
                    this.World.spawnEntity();
                }
            }
        }
    }

    OnDisconnect(msg: ArrayBuffer) {
        if (msg.byteLength > 0) {
            const buff = Buffer.from(msg);
            console.log(`NetworkClient::OnDisconnect ${buff.toString()}`);
        }
    }
}
