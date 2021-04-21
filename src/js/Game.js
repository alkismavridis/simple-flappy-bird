
const GAME = {
  CLOCK_TIK: 100,

  MAX_SPEED_BOTTOM: -50,
  MAX_SPEED_TOP: 50,

  GRAVITY: -15,
  JUMP_PUSH: 50,
  SPEED_X: 30,

  OBSTACLE_COUNT: 5,
  FIRST_OBSTACLE: 1500,
  OBSTACLE_GAP_X: 500,
  OBSTACLE_GAP_Y: 200,
  OBSTACLE_WIDTH: 150,
  OBSTACLE_AREA_PADDING: 100,

  HEIGHT: 1000,
  WIDTH: 1000,
  FLAPPY_X: 200,
  FLAPPY_SIZE: 30,

  STATE: {
    WAIT_TO_START: 1,
    PLAYS: 2,
    LOST: 3,
  }
};


class Game {
  constructor () {
    this.initialize();
    this._interval = setInterval(() => this.onClockTick(), GAME.CLOCK_TIK);
  }

  onMainButton() {
    if (this.state === GAME.STATE.PLAYS) {
      this._speedY = GAME.JUMP_PUSH;
    } else {
      this.initialize();
      this.state = GAME.STATE.PLAYS;
    }
  }

  stop() {
    clearInterval(this._interval);
  }

  /// PRIVATE
  initialize() {
    this.positionY = GAME.HEIGHT / 2;
    this.positionX = GAME.FLAPPY_X;
    this.state = GAME.STATE.WAIT_TO_START;

    this.obstacles = [];
    for (let i = 0; i < GAME.OBSTACLE_COUNT; ++i) {
      this.addObstacle(this.obstacles);
    }

    this._speedY = 0;
  }

  onClockTick() {
    if (this.state !== GAME.STATE.PLAYS) {
      return;
    }

    this.moveObstacles();
    this.applyAcceleration(GAME.GRAVITY);
    this.applyMovement();

    if (this.positionY <= 0) {
      this.state = GAME.STATE.LOST;
    }

    const collidingObstacle = this.obstacles.find(ob => this.collidesWith(ob));
    if (collidingObstacle != null) {
      this.state = GAME.STATE.LOST;
    }
  }

  applyAcceleration(dv) {
    const newSpeedY = this._speedY + dv;

    if (newSpeedY < GAME.MAX_SPEED_BOTTOM) {
      this._speedY = GAME.MAX_SPEED_BOTTOM;
    } else if(newSpeedY > GAME.MAX_SPEED_TOP) {
      this._speedY = GAME.MAX_SPEED_TOP
    } else {
      this._speedY = newSpeedY;
    }
  }

  applyMovement() {
    this.positionY = Math.max(0, this.positionY + this._speedY);
  }

  moveObstacles() {
    if (this.obstacles.length === 0) {
      return;
    }

    this.obstacles.forEach(ob => ob.x -= GAME.SPEED_X);
    if (this.obstacles[0].x < - GAME.WIDTH) {
      const newObstacles = this.obstacles.slice(1);
      this.addObstacle(newObstacles);
      this.obstacles = newObstacles;
    }
  }

  addObstacle(obstacles) {
    const a = GAME.HEIGHT - 2*GAME.OBSTACLE_AREA_PADDING - GAME.OBSTACLE_GAP_Y;
    const b = GAME.OBSTACLE_AREA_PADDING + GAME.OBSTACLE_GAP_Y;
    const upperY = a * Math.random() + b;

    if (obstacles.length === 0) {
      obstacles.push(new Obstacle(
        GAME.FIRST_OBSTACLE,
        upperY,
        upperY - GAME.OBSTACLE_GAP_Y,
        GAME.OBSTACLE_WIDTH
      ));
    } else {
      const lastObstacle = obstacles[obstacles.length - 1];
      obstacles.push(new Obstacle(
        lastObstacle.x + GAME.OBSTACLE_GAP_X,
        upperY,
        upperY - GAME.OBSTACLE_GAP_Y,
        GAME.OBSTACLE_WIDTH
      ));
    }
  }

  collidesWith(obstacle) {
    if (obstacle.x > this.positionX + GAME.FLAPPY_SIZE) return false;
    if (obstacle.x + obstacle.width < this.positionX) return false;

    if (obstacle.upperGapY < this.positionY + GAME.FLAPPY_SIZE) return true;
    if (obstacle.downGapY > this.positionY) return true;

    return false;
  }
}

class Obstacle {
  constructor (x, upperGapY, downGapY, width) {
    this.x = x;
    this.width = width;
    this.upperGapY = upperGapY;
    this.downGapY = downGapY;
  }
}
