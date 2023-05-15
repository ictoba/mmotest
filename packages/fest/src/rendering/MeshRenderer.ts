import {Matrix4} from "@math.gl/core";
import {Component, Entity} from "@mmotest/ecs";
import {Camera} from "./Camera";
import {ProgramBuffers, initBuffers} from "./init-buffers";

export class MeshRenderer implements Component {
    shaderProgram: WebGLProgram | null;
    buffers: ProgramBuffers | null;
    vertexPosAttrLoc: number;
    vertexColorAttrLoc: number;

    entity: WeakRef<Entity>;
    projMatUniformLoc: WebGLUniformLocation | null;
    modelViewMatUniformLoc: WebGLUniformLocation | null;

    constructor(holder: Entity) {
        this.shaderProgram = null;
        this.buffers = null;
        this.vertexPosAttrLoc = -1;
        this.vertexColorAttrLoc = -1;
        this.projMatUniformLoc = null;
        this.modelViewMatUniformLoc = null;

        this.entity = new WeakRef(holder);
    }

    Update(): void {
        return;
    }

    Init(gl: WebGLRenderingContext): void {
        const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

        const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

        this.shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        if (!this.shaderProgram) {
            return;
        }

        this.projMatUniformLoc = gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix");
        this.modelViewMatUniformLoc = gl.getUniformLocation(this.shaderProgram, "uModelViewMatrix");

        this.vertexPosAttrLoc = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.vertexColorAttrLoc = gl.getAttribLocation(this.shaderProgram, "aVertexColor");

        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        const buffers = initBuffers(gl);
        if (buffers) {
            this.buffers = buffers;
        }
    }

    Render(gl: WebGLRenderingContext, camera: Camera): void {
        if (!this.buffers) {
            return;
        }

        const entity = this.entity.deref();
        if (!entity) {
            return;
        }

        setPositionAttribute(gl, this.buffers.position, this.vertexPosAttrLoc);

        setColorAttribute(gl, this.buffers.color, this.vertexColorAttrLoc);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

        // Tell WebGL to use our program when drawing
        gl.useProgram(this.shaderProgram);

        const projectionMatrix = new Matrix4();

        projectionMatrix.perspective({
            fovy: camera.fieldOfView,
            aspect: camera.aspect,
            far: camera.zFar,
            near: camera.zNear,
        });

        // Set the shader uniforms
        gl.uniformMatrix4fv(this.projMatUniformLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(this.modelViewMatUniformLoc, false, entity.transform.modelMatrix);

        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    if (!shaderProgram || !vertexShader || !fragmentShader) {
        return null;
    }
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);

    if (!shader) {
        return null;
    }

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function setPositionAttribute(gl: WebGLRenderingContext, posAttr: WebGLBuffer, vertexPositionPos: number) {
    const numComponents = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, posAttr);
    gl.vertexAttribPointer(vertexPositionPos, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(vertexPositionPos);
}

function setColorAttribute(gl: WebGLRenderingContext, colorAttr: WebGLBuffer, vertexColorPos: number) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorAttr);
    gl.vertexAttribPointer(vertexColorPos, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(vertexColorPos);
}
