import {createId} from "@paralleldrive/cuid2";
import {Transform} from "./Transform";
import {Component} from "./Component";

export class Entity {
    id: number;
    name: string;
    transform: Transform;
    children: Array<Entity>;
    parent: WeakRef<Entity> | null;
    components: Array<Component>;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.transform = new Transform(this);
        this.children = [];
        this.parent = null;
        this.components = [];
    }

    addChild(child: Entity) {
        child.parent = new WeakRef(this);
        this.children.push(child);
    }

    removeChild(child: Entity) {
        this.children = this.children.filter((x) => x.id !== child.id);
    }

    addComponent(component: Component) {
        this.components.push(component);
    }

    Update() {
        for (const component of this.components) {
            component.Update();
        }

        this.transform.Update();
        for (const child of this.children) {
            child.Update();
        }
    }
}
