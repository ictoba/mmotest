import { Component, Entity } from "@mmotest/ecs";

export class SimpleScript implements Component {
    entity: WeakRef<Entity>;
    private goingRight = true;

    constructor(holder: Entity) {
        this.entity = new WeakRef(holder);
    }

    Update(): void {
        const entity = this.entity.deref();
        if (entity) {
            if (entity.transform.position.x > 5) {
                this.goingRight = false;
            } else if (entity.transform.position.x < -5) {
                this.goingRight = true;
            }

            if (this.goingRight) {
                entity.transform.position.x += 0.1;
            } else {
                entity.transform.position.x -= 0.1;
            }
        }
    }
}
