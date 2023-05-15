import {Entity} from "@mmotest/ecs";
import * as promises from "timers/promises";
import {NetworkManager} from "./NetworkManager";
import {SimpleScript} from "./SimpleScriptComponent";

const shutdown = (sig: NodeJS.Signals) => {
    console.log(`got signal ${sig}`);
    process.exit(0);
};

export class World {
    serverUpdateRate = 16;

    entities: Array<Entity> = [];
    networkManager: NetworkManager;

    entitySequence = 1;

    constructor() {
        this.networkManager = new NetworkManager(this);
    }

    Init() {
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

        /*const obj = new Entity(1, "obj-01");
        obj.transform.position.z = -10;
        obj.addComponent(new SimpleScript(obj));
        this.entities.push(obj);*/

        this.networkManager.Init(9001);
    }

    async Run(): Promise<void> {
        let ticks = 0;

        let isRunning = true;
        let timeStart = new Date().getTime();
        while (isRunning) {
            const deltaTime = new Date().getTime() - timeStart;
            timeStart = new Date().getTime();

            if (ticks === 1000) {
                this.spawnEntity();
            }

            /*if (ticks === 1000) {
                this.spawnEntity(2);
            }

            if (ticks === 10000) {
                this.spawnEntity(3);
            }*/

            for (const entity of this.entities) {
                entity.Update();
            }

            for (const client of this.networkManager.clientsMap) {
                for (const entity of this.entities) {
                    client[1].UpdatePosition(entity);
                }
            }

            this.networkManager.Update();

            const sleepTime = this.serverUpdateRate - deltaTime;
            if (sleepTime > 0) {
                await promises.setTimeout(sleepTime);
            }
            ++ticks;

            /*if (ticks % 100 === 0) {
                console.log(`Number of entities: ${this.entities.length}`);
            }*/
        }

        console.log(`Total number of ticks: ${ticks}`);
    }

    spawnEntity() {
        const id = this.entitySequence++;
        const obj = new Entity(id, `obj-${id}`);
        obj.transform.position.y = id * 0.5 - 2;
        obj.transform.position.z = -10;
        obj.addComponent(new SimpleScript(obj));
        this.entities.push(obj);

        for (const client of this.networkManager.clientsMap) {
            for (const entity of this.entities) {
                client[1].SpawnEntity(entity);
            }
        }
    }
}
