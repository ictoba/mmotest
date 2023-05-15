import {Component, Entity} from "@mmotest/ecs";
import {SpawnEntityPacket} from "@mmotest/network";
import {Camera} from "./Camera";
import {GameNetwork} from "./GameNetwork";
import {MeshRenderer} from "./MeshRenderer";

class KeyScript implements Component {
    entity: WeakRef<Entity>;

    constructor(holder: Entity, private input: GameInput) {
        this.entity = new WeakRef(holder);
    }

    Update(): void {
        const entity = this.entity.deref();
        if (entity) {
            if (this.input.IsKeyPressed(KeyCodes.D)) {
                entity.transform.position.x += 0.1;
            }
            if (this.input.IsKeyPressed(KeyCodes.A)) {
                entity.transform.position.x -= 0.1;
            }

            if (this.input.IsKeyPressed(KeyCodes.W)) {
                entity.transform.position.y += 0.1;
            }
            if (this.input.IsKeyPressed(KeyCodes.S)) {
                entity.transform.position.y -= 0.1;
            }
        }
    }
}

export enum KeyCodes {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
    H = "H",
    I = "I",
    J = "J",
    K = "K",
    L = "L",
    M = "M",
    N = "N",
    O = "O",
    P = "P",
    Q = "Q",
    R = "R",
    S = "S",
    T = "T",
    U = "U",
    V = "V",
    W = "W",
    X = "X",
    Y = "Y",
    Z = "Z",
}

class GameInput {
    private keys: Map<KeyCodes, boolean> = new Map<KeyCodes, boolean>();
    //constructor() {}

    public IsKeyPressed(key: KeyCodes): boolean {
        return this.keys.get(key) ?? false;
    }

    public SetKeyPressed(key: KeyCodes) {
        this.keys.set(key, true);
    }

    LateUpdate() {
        for (const key of this.keys.keys()) {
            this.keys.set(key, false);
        }
    }
}

export class Game {
    gl: WebGLRenderingContext | null;
    entities: Array<Entity>;
    camera: Camera | null;
    renderers: Array<MeshRenderer>;
    private input: GameInput = new GameInput();
    private network: GameNetwork = new GameNetwork(this);

    constructor() {
        this.gl = null;
        this.entities = [];
        this.camera = null;
        this.renderers = [];

        /*const child = new Entity(1, "box1");
        child.transform.position.z = -10;
        const meshRenderer = new MeshRenderer(child);
        child.addComponent(meshRenderer);
        child.addComponent(new KeyScript(child, this.Input));
        this.renderers.push(meshRenderer);
        this.entities.push(child);*/
    }

    get Input(): GameInput {
        return this.input;
    }

    get Network(): GameNetwork {
        return this.network;
    }

    Init(canvas: HTMLCanvasElement): boolean {
        const gl = canvas.getContext("webgl");
        if (!gl) {
            return false;
        }

        this.gl = gl;

        const camera = new Camera(canvas as HTMLElement);
        if (!camera) {
            return false;
        }

        this.camera = camera;

        for (const x of this.renderers) {
            x.Init(this.gl);
        }

        /*this.Spawn({
            opCode: 1,
            entityId: 1,
            posX: 0,
            posY: 0,
            posZ: -10,
        });*/

        return true;
    }

    // eslint-disable-next-line
    Update(deltaTime: number) {
        for (const entity of this.entities) {
            entity.Update();
        }

        this.Input.LateUpdate();
    }

    Render() {
        if (!this.gl || !this.camera) {
            return;
        }
        const gl = this.gl;

        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (const renderer of this.renderers) {
            renderer.Render(gl, this.camera);
        }
    }

    Spawn(pack: SpawnEntityPacket) {
        const child = new Entity(pack.entity.id, `obj-${pack.entity.id}`);
        child.transform.position.x = pack.entity.position.x;
        child.transform.position.y = pack.entity.position.y;
        child.transform.position.z = pack.entity.position.z;

        child.transform.rotation.x = pack.entity.rotation.x;
        child.transform.rotation.y = pack.entity.rotation.y;
        child.transform.rotation.z = pack.entity.rotation.z;

        child.transform.scale.x = pack.entity.scale.x;
        child.transform.scale.y = pack.entity.scale.y;
        child.transform.scale.z = pack.entity.scale.z;

        const meshRenderer = new MeshRenderer(child);
        if (this.gl) {
            meshRenderer.Init(this.gl);
        }
        child.addComponent(meshRenderer);
        child.addComponent(new KeyScript(child, this.Input));
        this.renderers.push(meshRenderer);
        this.entities.push(child);
    }

    SpawnX() {
        console.log(`SpawnX`);
        const pack = {
            opCode: 1,
            entity: {
                id: 1,
                position: {
                    x: 0,
                    y: 0,
                    z: -10,
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            },
        };
        this.Spawn(pack);
    }
}
