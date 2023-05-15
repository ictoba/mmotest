import { Entity } from "./Entity";

export interface Component {
    entity: WeakRef<Entity>;

    Update(): void;
}
