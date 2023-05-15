export class Camera {
    fieldOfView: number;
    aspect: number;
    zNear: number;
    zFar: number;

    constructor(canvas: HTMLElement) {
        this.fieldOfView = (45 * Math.PI) / 180;
        this.aspect = canvas.clientWidth / canvas.clientHeight;
        this.zNear = 0.1;
        this.zFar = 100.0;
    }
}
