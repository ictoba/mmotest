import * as sd from "sirdez";

const Vector3 = sd.struct({
    x: sd.float32,
    y: sd.float32,
    z: sd.float32,
});

const EntityPosition = sd.struct({
    id: sd.uint32,
    position: Vector3,
    rotation: Vector3,
    scale: Vector3,
});

export const PositionUpdatePacketSerializer = sd.use(
    sd.struct({
        opCode: sd.uint8,
        entityId: sd.uint32,
        position: Vector3,
    })
);

export const SpawnEntityPacketSerializer = sd.use(
    sd.struct({
        opCode: sd.uint8,
        entity: EntityPosition,
    })
);

export const JoinWorldPacketSerializer = sd.use(
    sd.struct({
        opCode: sd.uint8,
        accountId: sd.uint32,
    })
);

export const ServerCommandPacketSerializer = sd.use(
    sd.struct({
        opCode: sd.uint8,
        command: sd.string(sd.utf8, sd.uint8),
    })
);

export type JoinWorldPacket = sd.GetType<typeof JoinWorldPacketSerializer>;
export type SpawnEntityPacket = sd.GetType<typeof SpawnEntityPacketSerializer>;
export type PositionUpdatePacket = sd.GetType<typeof PositionUpdatePacketSerializer>;
export type ServerCommandPacket = sd.GetType<typeof ServerCommandPacketSerializer>;
