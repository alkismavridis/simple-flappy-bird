
const WEBGL_RENDERER = {
  CLOCK_TIK: 30,
  UTILS: new WebGlUtils(),
  CIRCLE_VERTEX_COUNT: 20
};

class WebglGameRenderer {
  constructor (canvas, game) {
    this.game = game;
    this.gl = canvas.getContext("webgl2");
    this.lastRepaintTime = Date.now();
    this.hasStopped = false;
    
    this.program = null;
    this.flappyBirdVao = null;
    this.flappyBirdBuffer = null;
    
    this.obstacleVao = null;
    this.obstacleBuffer = null;

    if (this.gl === null) {
      throw new Error("Unable to initialize WebGL 2. Your browser or machine may not support it.");
    }

    this.initGraphics();
    requestAnimationFrame(() => this.onClockTick());
  }

  stop () {
    this.hasStopped = true;
    this.gl.deleteProgram(this.program);
    
    this.gl.deleteVertexArray(this.flappyBirdVao);
    this.gl.deleteBuffer(this.flappyBirdBuffer);
    
    this.gl.deleteBuffer(this.obstacleVao);
    this.gl.deleteBuffer(this.obstacleBuffer);
  }

  onClockTick () {
    if (this.hasStopped) return;
    requestAnimationFrame(() => this.onClockTick());

    const now = Date.now();
    if (now - this.lastRepaintTime > WEBGL_RENDERER.CLOCK_TIK) {
      this.lastRepaintTime = now;
      this.render();
    }
  }

  render () {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0.58, 1, 0.96, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.game.obstacles.forEach(o => this.renderObstacle(o));
    this.renderFlappyBird();
  }

  initGraphics () {
    const programData = {
      vertexShader: `#version 300 es
        in vec4 position;
        in vec4 vertexColor;
        uniform vec4 OFFSET;
        
        void main() {
          gl_Position = position + OFFSET;
        }
      `,

      fragmentShader: `#version 300 es
        precision highp float;
        uniform vec4 COLOR;

        out vec4 outColor;         
        void main() {
          outColor = COLOR;
        }
      `,

      attributes: [
        { name: "position", offset: 0, length: 2, type: this.gl.FLOAT, stride: 0 },
      ],
    };
    
    this.program = WEBGL_RENDERER.UTILS.createProgram(this.gl, programData.vertexShader, programData.fragmentShader, true);
    
    this.flappyBirdVao = WEBGL_RENDERER.UTILS.createVertexArray(this.gl, true);
    this.flappyBirdBuffer = WEBGL_RENDERER.UTILS.createBuffer(this.gl, this.program, true, programData.attributes);
    this.setFlappyBirdBufferData(this.flappyBirdBuffer);

    this.obstacleVao = WEBGL_RENDERER.UTILS.createVertexArray(this.gl, true);
    this.obstacleBuffer = WEBGL_RENDERER.UTILS.createBuffer(this.gl, this.program, true, programData.attributes);
  }

  renderObstacle(obstacle) {
    this.gl.bindVertexArray(this.obstacleVao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.obstacleBuffer);
    WEBGL_RENDERER.UTILS.setUniform4f(this.gl, this.program, "COLOR", 0.12, 0.30, 0, 1)
    WEBGL_RENDERER.UTILS.setUniform4f(this.gl, this.program, "OFFSET", 0, 0, 0, 0)
    
    const x1 = obstacle.x / GAME.WIDTH * 2 - 1;
    const x2 = (obstacle.x + obstacle.width) / GAME.WIDTH * 2 - 1;
    const y1 = 1;
    const y2 = obstacle.upperGapY / GAME.HEIGHT * 2 - 1;
    const y3 = obstacle.downGapY / GAME.HEIGHT * 2 - 1;
    const y4 = -1;

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      
      x1, y2,
      x2, y2,
      x2, y1,

      x1, y3,
      x2, y3,
      x1, y4,

      x1, y4,
      x2, y4,
      x2, y3,
    ]), this.gl.STATIC_DRAW);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 12);
  }
  
  renderFlappyBird() {
    this.gl.bindVertexArray(this.flappyBirdVao);
    
    const positionX = this.game.positionX / GAME.WIDTH * 2;
    const positionY = this.game.positionY / GAME.HEIGHT * 2;

    WEBGL_RENDERER.UTILS.setUniform4f(this.gl, this.program, "OFFSET", positionX, positionY, 0, 0, 0)
    if (this.game.state === GAME.STATE.LOST) {
      WEBGL_RENDERER.UTILS.setUniform4f(this.gl, this.program, "COLOR", 1, 0, 0, 1)
    } else {
      WEBGL_RENDERER.UTILS.setUniform4f(this.gl, this.program, "COLOR", 0.96, 0.97, 0.35, 1)
    }
    
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, WEBGL_RENDERER.CIRCLE_VERTEX_COUNT);
  }
  
  setFlappyBirdBufferData() {
    const radiusX = GAME.FLAPPY_SIZE / GAME.WIDTH;
    const radiusY = GAME.FLAPPY_SIZE / GAME.HEIGHT;
    const centerX = -1 + radiusX;
    const centerY = -1 + radiusY;
    
    const circleData = [];
    for (let i = 0; i < WEBGL_RENDERER.CIRCLE_VERTEX_COUNT; i++) {
      circleData.push( centerX + radiusX * Math.cos(i*2*Math.PI/WEBGL_RENDERER.CIRCLE_VERTEX_COUNT) );
      circleData.push( centerY + radiusY * Math.sin(i*2*Math.PI/WEBGL_RENDERER.CIRCLE_VERTEX_COUNT) );
    }

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(circleData), this.gl.STATIC_DRAW);
  }
}

