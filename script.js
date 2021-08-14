let snakes = [];
let dots;
const numDots = 5000;
const numAISnakes = 25;
const snakeLength = 10;
let score = 0;
let zoom = 1;
let snake;
let diff;
let firacode;
let counterBall = 0;
let randDir;
let speedTimer = 0;
let timer = 0;
var mode = true;
var counter = 0;
let sortedSnakesByLength = snakes;

function preload() {
  firacode = loadFont("Fira-Code.ttf");
  googlesans = loadFont("googlesans.ttf");
  googlebold = loadFont("googlesans-bold.ttf");
  img = loadImage("logo.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(220, 0, 15);
  dots = [];

  input = createInput('YJ');
  input.position(width / 2 - (input.width / 1.75), height / 1.8);
  button = createButton('start');
  button.position(input.x + input.width, height / 1.8);
  button.mousePressed(incMode);
}

function decMode() {
  mode = true;
  button.show();
  input.show();
  mode = true;
  background(220, 0, 15, 30);
}


function incMode() {
  snake = new Snake(width / 2, height / 2);
  snakes.push(snake);
  snake.name = input.value();
  mode = !mode;
  button.hide();
  input.hide();
  input.value(' ');
}

function draw() {
  if (mode) {
    snakes.length = 0;
    dots.length = 0;
    textAlign(CENTER);

    textFont(googlebold, 90);
    fill(95);
    textStyle(BOLD);

    fill(217, 65, 100);
    text("sl", width / 2 - 175, height / 2 - 100);
    fill(138, 40, 75);
    text("it", width / 2 - 110, height / 2 - 100);
    fill(34, 50, 100);
    text("he", width / 2 - 25, height / 2 - 100);
    fill(5, 65, 100);
    text("r.", width / 2 + 55, height / 2 - 100);
    fill(210, 3, 85);
    text("ml", width / 2 + 145, height / 2 - 100);
    textFont('Georgia');
    text('🙈🔥', width / 2, height / 10 + 60);
    textStyle(NORMAL);
    textFont(googlesans, 30);
    fill(75);
    text("one slither at a time", width / 2, height / 1.4);
    image(img, width - 70, height - 70, 50, 50);
  } else {
    if (counter == 0) {
      counter = 1;
      if (!snake) {
        snake = new Snake(width / 2, height / 2);
        snakes.push(snake);
      }
      for (let i = 0; i < numDots; i++) {
        dots.push(new BouncyDot());
      }
      for (let i = 0; i < numAISnakes; i++) {
        snakes.push(new AISnake());
      }
      background(220, 0, 15);
    }
    background(220, 0, 15);
    textSize(14);
    fill(95);
    if (snake) {
      score = snake.length;
      text("Your length: " + snake.length, 50, height - 20);
    }

    translate(width / 2, height / 2);
    let newzoom = (40 / (snake.size + 40));
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    translate(-snake.pos.x, -snake.pos.y);

    while (snakes.length < numAISnakes) {
      snakes.push(new AISnake());
    }
    while (dots.length < numDots) {
      dots.push(new BouncyDot());
    }

    for (let s = snakes.length - 1; s >= 0; s--) {
      for (let d = dots.length - 1; d >= 0; d--) {
        if (snakes[s].eatsBlob(dots[d])) {
          diff = floor(dots[d].r / 3);
          snakes[s].length += diff;
          for (let j = 0; j < diff; j++)
            snakes[s].addTailSegment();
          if (snakes[s].length % 20 == 0)
            snakes[s].size = floor(snakes[s].length / 20);
          dots.splice(d, 1);
        }
      }
    }

    for (let d = dots.length - 1; d >= 0; d--)
      dots[d].display();

    for (let s = snakes.length - 1; s >= 0; s--) {
      snakes[s].draw();
    }
    if (frameCount % 50 == 0) {
      updateLeaderboard();
    }
    try {
      showLeaderboard();
    } catch (err) {
      // something something skip error
    }
  }
}

function showLeaderboard() {
  if (!mode) {
    for (let s = 5; s >= 0; s--) {
      fill(sortedSnakesByLength[s].color, sortedSnakesByLength[s].sat, 80);
      textFont(firacode, 12 / zoom);
      // console.log(zoom);
      text(padNum(padName(sortedSnakesByLength[s].name, 10) + padNum(sortedSnakesByLength[s].length, 5)), snake.pos.x + width / 2.7 + (2 * 12 / (zoom)), snake.pos.y - height / 2.2 + s * 12 / zoom);
      fill(225);
      textFont(googlesans)
      text("Leaderboard", snake.pos.x + width / 2.7, snake.pos.y - height / 2.7 - 6 * 12)
    }
  }
}

function updateLeaderboard() {
  sortedSnakesByLength.sort((a, b) => (a.length < b.length) ? 1 : -1);
}

class BouncyDot {
  constructor(x, y, r, color, baseXVelocity, baseYVelocity) {
    // Randomly generate position
    if (x != null) this.x = x;
    // else this.x = random(-width * 20, width * 20);
    else this.x = this.randNormalDist(-10 * width, 10 * width, 1);
    // console.log(this.x);
    if (y != null) this.y = y;
    // else this.y = random(-height * 20, height * 20);
    else this.y = this.randNormalDist(-10 * height, 10 * height, 1);


    // Randomly generate radius
    if (r != null) this.r = r;
    else this.r = random(3, 10);
    // Randomly generate color
    if (color != null) this.color = color;
    else this.color = random(360);
    // Randomly generate a master velocity (broken into components)...
    if (baseXVelocity != null) this.baseXVelocity = baseXVelocity;


    else this.baseXVelocity = random(0, 0.2);
    if (baseYVelocity != null) this.baseYVelocity = baseYVelocity;
    else this.baseYVelocity = random(0, 0.2);
    // ...and use those as starting velocities.
    this.xVelocity = this.baseXVelocity;
    this.yVelocity = this.baseYVelocity;
  }

  randNormalDist(min, max, skew) {
    let u = 0, v = 0;
    while (u === 0) u = random() //Converting [0,1) to (0,1)
    while (v === 0) v = random()
    let num = sqrt(-2.0 * log(u)) * cos(2.0 * PI * v)

    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0)
      num = randNormalDist(min, max, skew) // resample between 0 and 1 if out of range

    else {
      num = pow(num, skew) // Skew
      num *= max - min // Stretch to fill range
      num += min // offset to min
    }
    return num;
  }

  float() {
    this.x += this.xVelocity;
    this.y += this.yVelocity;

    if (this.x + this.r > width) {
      this.xVelocity = -1 * this.baseXVelocity;
    }
    if (this.x - this.r < 0) {
      this.xVelocity = this.baseXVelocity;
    }
    if (this.y + this.r > height) {
      this.yVelocity = -1 * this.baseYVelocity;
    }
    if (this.y - this.r < 0) {
      this.yVelocity = this.baseYVelocity;
    }

  }

  display() {
    if (this.x >= snake.pos.x - width && this.x <= snake.pos.x + width && this.y >= snake.pos.y - height && this.y <= snake.pos.y + height) {
      fill(this.color, 70, 100);
      noStroke();
      ellipse(this.x, this.y, this.r * 2);
    }

  }
}

class AISnake {
  constructor() {
    this.pos = createVector(random(-2 * width, 2 * width), random(-2 * height, 2 * height));
    this.vel = createVector(0, 0);
    this.size = 0;
    this.arr = [];
    this.length = 10;

    this.color = random(360);
    this.sat = random(20, 100);

    if (this.findClosestDot()) {
      this.randomX = this.findClosestDot().x;
      this.randomY = this.findClosestDot().y;
    }
    this.arr.push(new TailSegment(this.pos.x, this.pos.y));
    for (let i = 1; i < this.length; i++) {
      this.arr.push(new TailSegment(this.arr[i - 1].pos.x, this.arr[i - 1].pos.y));
    }
    this.nameList = ["Adrian", "Arianne", "Ash", "Carlos", "Christ", "Donna", "Emily", "Felicia", "Gabriel", "Galilea", "Heldanna", "Isabel", "Janat", "Joe", "Jonah", "Jose", "Juan ", "Julia", "Kate", "Megan", "Meryl", "Nikki", "Nneoma", "Ojasw", "Olivia", "Orlando", "Peter", "Savar", "Youshra", "Becky", "YJ"];

    this.name = this.nameList[floor(random() * this.nameList.length)];
  }

  draw() {
    if (frameCount % 20 == 0) {
      this.randomX = this.findClosestDot().x;
      this.randomY = this.findClosestDot().y;
    }

    randDir = createVector(this.randomX - this.pos.x, this.randomY - this.pos.y);
    randDir.setMag(3);
    this.vel.lerp(randDir, 0.2);
    this.pos.add(this.vel);
    this.arr[0].pos.x = this.pos.x;
    this.arr[0].pos.y = this.pos.y;

    for (let i = this.arr.length - 1; i >= 1; i--) {
      this.arr[i].pos.x = this.arr[i - 1].pos.x;
      this.arr[i].pos.y = this.arr[i - 1].pos.y;
      this.drawBody(this.arr[i].pos.x, this.arr[i].pos.y);
    }

    this.drawHead();

    for (let s = snakes.length - 1; s >= 0; s--) {
      if (snakes[s] != this && this.collideSnake(snakes[s]))
        this.destroy();
    }

    fill(this.color, 60, 60);
    text(this.name, this.pos.x + 15, this.pos.y + 15);
  }

  drawBody(x, y) {
    fill(this.color, this.sat, 100);
    ellipse(x, y, 40 + this.size);
  }

  drawHead() {
    let x = this.pos.x;
    let y = this.pos.y;
    let d = 5;

    // circle
    fill(this.color, this.sat, 100);
    ellipse(x, y, 40 + this.size);
    fill(100);
    let eyeX1 = ((randDir.x - (width / 2)) / width) * (18 + this.size / 2) / 2;
    let eyeY1 = ((randDir.y - (height / 2)) / height) * (18 + this.size / 2) / 2;
    let eyeX = ((randDir.x - (width / 2)) / width) * ((18 + this.size / 2) + (10 + this.size / 4)) / 2;
    let eyeY = ((randDir.y - (height / 2)) / height) * ((18 + this.size / 2) + (10 + this.size / 4)) / 2;

    // eyes
    ellipse(x - 9 + eyeX1 - this.size / 4, y + eyeY1, 18 + this.size / 2);
    ellipse(x + 9 + eyeX1 + this.size / 4, y + eyeY1, 18 + this.size / 2);

    // pupils
    fill(0);
    ellipse(x - 9 + eyeX - this.size / 4, y + eyeY, 10 + this.size / 4);
    ellipse(x + 9 + eyeX + this.size / 4, y + eyeY, 10 + this.size / 4);
  }

  eatsBlob(blob) {
    return collideCircleCircle(this.pos.x, this.pos.y, 40 + this.size, blob.x, blob.y, blob.r);
    // console.log(blob.x);
  }

  addTailSegment() {
    this.arr.push(new TailSegment(this.arr[this.arr.length - 1].pos.x, this.arr[this.arr.length - 1].pos.y));
  }

  collideSnake(otherSnake) {
    for (let i = 0; i < otherSnake.arr.length; i++) {
      let collide = collideCircleCircle(this.pos.x, this.pos.y, 40 + this.size, otherSnake.arr[i].pos.x, otherSnake.arr[i].pos.y, 40 + otherSnake.size);

      if (collide)
        return true;
    }
  }

  destroy() {
    for (let i = 0; i < this.arr.length; i += 5) {
      dots.push(new BouncyDot(this.arr[i].pos.x, this.arr[i].pos.y, 10 + this.size, this.color, 0.05, 0.05));
    }

    let index = snakes.indexOf(this);
    if (index > -1) {
      snakes.splice(index, 1);
    }
  }

  findClosestDot() {
    let closestValue = Infinity;
    let closestDot = dots[0];
    for (let i = 0; i < dots.length; i++) {
      let dist = sqrt((this.pos.x - dots[i].x) ** 2 + (this.pos.y - dots[i].y) ** 2);
      if (dist < closestValue) {
        closestValue = dist;
        closestDot = dots[i];
      }
    }
    return closestDot;
  }
}

class Snake {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.size = 0;
    this.arr = [];
    this.length = 10;
    this.name = "";
    this.color = random(360);
    this.sat = random(20, 100);

    this.arr.push(new TailSegment(this.pos.x, this.pos.y));
    for (let i = 1; i < this.length; i++) {
      this.arr.push(new TailSegment(this.arr[i - 1].pos.x, this.arr[i - 1].pos.y));
    }
  }

  draw() {
    let newvel = createVector(mouseX - width / 2, mouseY - height / 2);
    if (mouseIsPressed && this.length >= 10) {
      newvel.setMag(6);
      if (frameCount % 20 == 0) this.removeTailSegment();
    }
    else newvel.setMag(3);
    this.vel.lerp(newvel, 0.2);
    this.pos.add(this.vel);

    this.arr[0].pos.x = this.pos.x;
    this.arr[0].pos.y = this.pos.y;

    if (mouseIsPressed && this.length >= 10 && this.length <= 100)
      this.drawGlow();

    for (let i = this.arr.length - 1; i >= 1; i--) {
      this.arr[i].pos.x = this.arr[i - 1].pos.x;
      this.arr[i].pos.y = this.arr[i - 1].pos.y;
      this.drawBody(this.arr[i].pos.x, this.arr[i].pos.y);
    }
    this.drawHead();

    for (let s = 0; s < snakes.length; s++) {
      if (snakes[s] != this && this.collideSnake(snakes[s]))
        this.destroy();
    }

    fill(this.color, 60, 60);
    text(this.name, this.pos.x + 15, this.pos.y + 15);
  }

  drawBody(x, y) {
    fill(this.color, this.sat, 80);
    ellipse(x, y, 40 + this.size);
  }

  drawGlow() {

    for (let i = 1; i < this.arr.length; i++) {
      drawingContext.shadowBlur = 8;
      drawingContext.shadowColor = color(this.color, this.sat, 100);
      fill(this.color, this.sat, 80);
      ellipse(this.arr[i].pos.x, this.arr[i].pos.y, 44 + this.size);
    }
    drawingContext.shadowBlur = 0;

  }

  drawHead() {
    let x = this.pos.x;
    let y = this.pos.y;
    let d = 5;

    // circle
    fill(this.color, this.sat, 80);
    ellipse(x, y, 40 + this.size);
    fill(100);
    let eyeX1 = ((mouseX - (width / 2)) / width) * (18 + this.size / 2) / 2;
    let eyeY1 = ((mouseY - (height / 2)) / height) * (18 + this.size / 2) / 2;
    let eyeX = ((mouseX - (width / 2)) / width) * ((18 + this.size / 2) + (10 + this.size / 4)) / 2;
    let eyeY = ((mouseY - (height / 2)) / height) * ((18 + this.size / 2) + (10 + this.size / 4)) / 2;

    // eyes
    ellipse(x - 9 + eyeX1 - this.size / 4, y + eyeY1, 18 + this.size / 2);
    ellipse(x + 9 + eyeX1 + this.size / 4, y + eyeY1, 18 + this.size / 2);

    // pupils
    fill(0);
    ellipse(x - 9 + eyeX - this.size / 4, y + eyeY, 10 + this.size / 4);
    ellipse(x + 9 + eyeX + this.size / 4, y + eyeY, 10 + this.size / 4);
  }

  eatsBlob(blob) {
    return collideCircleCircle(this.pos.x, this.pos.y, 40 + this.size, blob.x, blob.y, blob.r);
  }

  addTailSegment() {
    this.arr.push(new TailSegment(this.arr[this.arr.length - 1].pos.x, this.arr[this.arr.length - 1].pos.y));
  }

  removeTailSegment() {
    if (this.arr.length > 10)
      this.arr.pop();
    this.length--;
  }

  collideSnake(otherSnake) {

    for (let i = 0; i < otherSnake.arr.length; i++) {

      let collide = collideCircleCircle(this.pos.x, this.pos.y, 40 + this.size, otherSnake.arr[i].pos.x, otherSnake.arr[i].pos.y, 40 + otherSnake.size);

      if (collide)
        return true;

    }

  }

  destroy() {
    for (let i = 0; i < this.arr.length; i += 5) {
      dots.push(new BouncyDot(this.arr[i].pos.x, this.arr[i].pos.y, 10 + this.size, this.color, 0.05, 0.05));
    }

    snakes.splice(0, 1);
    decMode();
  }
}

class TailSegment {
  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  draw() {
    fill(0, 65, 100);
    ellipse(this.pos.x, this.pos.y, 50);
  }
}

function padNum(num, size) { // /4 --> "  4" with pad(4, 3);
  let str = "";
  if (num) {
    num = num.toString();
    while (str.length < size) str += " ";
    str += num;
  }
  return str;
}

function padName(name, size) {
  if (name) {
    name = name.toString();
    while (name.length < size) name = name + " ";
    while (name.length > size) name = name.slice(0, size);
  }
  return name;
}