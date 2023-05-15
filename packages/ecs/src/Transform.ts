import {Matrix4, Vector3, toRadians} from "@math.gl/core";
import {Component} from "./Component";
import {Entity} from "./Entity";

export class Transform implements Component {
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    
    modelMatrix: Matrix4;
    
    entity: WeakRef<Entity>;

    constructor(holder: Entity) {
        this.position = new Vector3(0, 0, 0);
        this.rotation = new Vector3(0, 0, 0);
        this.scale = new Vector3(1, 1, 1);

        this.modelMatrix = new Matrix4(Matrix4.IDENTITY);
        this.entity = new WeakRef(holder);
    }

    Update(): void {
        if (this.entity.deref().parent) {
            const parent = this.entity.deref().parent.deref();
            this.modelMatrix = this.getLocalModelMatrix().multiplyLeft(parent.transform.modelMatrix);
        } else {
            this.modelMatrix = this.getLocalModelMatrix();
        }
    }

    getLocalModelMatrix() {
        const transformX = new Matrix4(Matrix4.IDENTITY);
        transformX.rotateX(toRadians(this.rotation.x));

        const transformY = new Matrix4(Matrix4.IDENTITY);
        transformY.rotateY(toRadians(this.rotation.y));

        const transformZ = new Matrix4(Matrix4.IDENTITY);
        transformZ.rotateZ(toRadians(this.rotation.z));

        const rotationMatrix = transformX.multiplyRight(transformY).multiplyRight(transformZ);

        return new Matrix4(Matrix4.IDENTITY).translate(this.position).multiplyRight(rotationMatrix).multiplyRight(new Matrix4(Matrix4.IDENTITY).scale(this.scale));
    }
}
