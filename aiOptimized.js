let snakes = [];
let dots;
const numDots = 10000;
const numAISnakes = 10;
const snakeLength = 10;
let score = 0;
let zoom = 1;
let snake;
let diff;
let counterBall = 0;
let randDir;
let speedTimer = 0;
let timer = 0;

let arrowX, arrowY;

//new ai cool stuff
let video;
let label = 'waiting...';
let classifier;

function preload(){
  classifier = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/s8qTu_32g/model.json');
}



function setup() {
    createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.hide();
  classifyVideo();


    // createCanvas(600, 600);
    colorMode(HSB, 360, 100, 100);
    dots = [];
    for (let i = 0; i < numDots; i++) {
        dots.push(new BouncyDot());
    }


    snake = new Snake(width / 2, height / 2);
    snakes.push(snake);
    for (let i = 0; i < numAISnakes; i++) {
        snakes.push(new AISnake());
    }

}


function classifyVideo(){
  classifier.classify(video, gotResults)
}

function gotResults(error, results)
{
  console.log("Within GotResults Function")
  if(error)
  {
    console.error(error);
    return;
  }

 
  label = results[0].label;
  classifyVideo();
}



function draw() {
    background(220, 0, 15);

  image(video, 0, 0,50,50);
  textSize(20);

  
   fill(100);
  text(label, 20,height - 50);


    textSize(14);
    fill(95);
    score = snake.length;
    text("Your length: " + snake.length, 20, height - 20);

    translate(width / 2, height / 2);
    let newzoom = (40 / (snake.size + 40));
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    translate(-snake.pos.x, -snake.pos.y);

    while (snakes.length < numAISnakes) {
        snakes.push(new AISnake());
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

    for (let d = dots.length - 1; d >= 0; d--) {

        // dots[d].float();
        dots[d].display();

    }

    // console.log(snakes.length);
    for (let s = snakes.length - 1; s >= 0; s--) {
        snakes[s].draw();
    }
}

class BouncyDot {
    constructor(x, y, r, color, baseXVelocity, baseYVelocity) {
        // Randomly generate position
        if (x != null) this.x = x;
        else this.x = random(-width * 20, width * 20);
        if (y != null) this.y = y;
        else this.y = random(-height * 20, height * 20);


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

        if (this.x >= snake.pos.x - width / 2 && this.x <= snake.pos.x + width / 2 && this.y >= snake.pos.y - height / 2 && this.y <= snake.pos.y + height / 2) {

            fill(this.color, 70, 100);
            noStroke();
            ellipse(this.x, this.y, this.r * 2);

        }

    }
}

class AISnake {
    constructor() {
        this.pos = createVector(random(-width, width), random(-height, height));
        this.vel = createVector(0, 0);
        this.size = 0;
        this.arr = [];
        this.length = 10;

        this.color = random(360);
        this.sat = random(20, 100);

        this.randomX = this.findClosestDot().x;
        this.randomY = this.findClosestDot().y;

        this.arr.push(new TailSegment(this.pos.x, this.pos.y));
        for (let i = 1; i < this.length; i++) {
            this.arr.push(new TailSegment(this.arr[i - 1].pos.x, this.arr[i - 1].pos.y));
        }
    }

    draw() {
        if (frameCount % 20 == 0) {
            this.randomX = this.findClosestDot().x;
            // console.log(dots[this.findClosestDot()].x);
            // console.log(dots[this.findClosestDot()].y);

            this.randomY = this.findClosestDot().y;

            // fill(100);
           // circle(this.randomX, this.randomY, 50);
        }

        randDir = createVector(this.randomX - this.pos.x , this.randomY - this.pos.y);
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

        this.color = random(360);
        this.sat = random(20, 100);

        this.arr.push(new TailSegment(this.pos.x, this.pos.y));
        for (let i = 1; i < this.length; i++) {
            this.arr.push(new TailSegment(this.arr[i - 1].pos.x, this.arr[i - 1].pos.y));
        }

        
    }

    draw() {

      if(label == "Up Right"){
          arrowX = width;
          arrowY = -height;
      }

      else if (label == "Up") {
          arrowX = 0;
          arrowY = -height;
      }

        else if (label == "Down") {
          arrowX = 0;
          arrowY = height;
        }

        else if (label == "Right Down") {
          arrowX = width;
          arrowY = height;
        }

        else if (label == "Left") {
          arrowX = -width;
          arrowY = 0;
        }

        else if (label == "Left Up") {
          arrowX = -width;
          arrowY = -height;
        }

        else if (label == "Down Left") {
          arrowX = -width;
          arrowY = height;
        }

        else if (label == "Right") {
          arrowX = width;
          arrowY = 0;
        }

        let newvel = createVector(arrowX, arrowY);
        if (mouseIsPressed && this.length >= 10) {
            newvel.setMag(6);
            if (frameCount % 20 == 0) this.removeTailSegment();
        }
        else newvel.setMag(3);
        this.vel.lerp(newvel, 0.2);
        this.pos.add(this.vel);

        this.arr[0].pos.x = this.pos.x;
        this.arr[0].pos.y = this.pos.y;

        if (mouseIsPressed && this.length >= 10)
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
