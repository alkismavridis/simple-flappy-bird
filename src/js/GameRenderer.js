
const RENDERER = {
  CLOCK_TIK: 30,
  COLORS: {
    FLAPPY_BIRD_PLAYS: "#f4f858",
    FLAPPY_BIRD_LOST: "#FF0000",
    FLAPPY_BIRD_NOT_STARTED: "#888888",
    BACKGROUND: "#93fff4",
    OBSTACLE: "#1e4c00",
  }
};


class GameRenderer {
  constructor (canvas, game) {
    this._game = game;
    this._ctx = canvas.getContext("2d");
    this._width = canvas.width;
    this._height = canvas.height;
    this._lastRepaintTime = Date.now();
    this._hasStopped = false;

    requestAnimationFrame(() => this.onClockTick());
  }

  stop() {
    this._hasStopped = true;
  }

  onClockTick() {
    if (this._hasStopped) return;
    requestAnimationFrame(() => this.onClockTick());

    const now = Date.now();
    if (now - this._lastRepaintTime > RENDERER.CLOCK_TIK) {
      this._lastRepaintTime = now;
      this.clear();
      this._game.obstacles.forEach(ob => this.paintObstacle(ob));
      this.paintFlappyBird();
    }
  }

  clear() {
    this._ctx.fillStyle = RENDERER.COLORS.BACKGROUND;
    this._ctx.fillRect(0, 0, this._width, this._height);
  }

  paintFlappyBird() {
    switch(this._game.state) {
      case GAME.STATE.PLAYS:
        this._ctx.fillStyle = RENDERER.COLORS.FLAPPY_BIRD_PLAYS;
        break;

      case GAME.STATE.LOST:
        this._ctx.fillStyle = RENDERER.COLORS.FLAPPY_BIRD_LOST;
        break;

      case GAME.STATE.WAIT_TO_START:
        this._ctx.fillStyle = RENDERER.COLORS.FLAPPY_BIRD_NOT_STARTED;
        break;
    }

    const flappyX = (this._game.positionX + GAME.FLAPPY_SIZE / 2) / GAME.WIDTH * this._width;
    const flappyY = this._height - (this._game.positionY + GAME.FLAPPY_SIZE / 2) / GAME.HEIGHT * this._height;
    const flappyWidth = GAME.FLAPPY_SIZE / GAME.WIDTH * this._width;

    this._ctx.beginPath();
    this._ctx.arc(flappyX, flappyY, flappyWidth / 2, 0, 2 * Math.PI, false);
    this._ctx.fill();
    this._ctx.closePath();
  }

  paintObstacle(obstacle) {
    this._ctx.fillStyle = RENDERER.COLORS.OBSTACLE;

    const obstacleX = obstacle.x / GAME.WIDTH * this._width;
    const obstacleY1 = this._height - obstacle.upperGapY / GAME.HEIGHT * this._height;
    const obstacleY2 = this._height - obstacle.downGapY / GAME.HEIGHT * this._height;
    const width = obstacle.width / GAME.WIDTH * this._width;

    this._ctx.fillRect(obstacleX, 0, width, obstacleY1);
    this._ctx.fillRect(obstacleX, obstacleY2, width, this._height - obstacleY1);
  }
}
