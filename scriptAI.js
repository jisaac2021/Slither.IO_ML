// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    HSB, background, colorMode, createCanvas, ellipse, fill, height,map
 *    noStroke, random, windowHeight, windowWidth, width, PI, translate, mouseY, mouseX, mouseOver, collideCircleCircle
 */

let snakes = [];
let dots;
const numDots = 10000;
const numSnakes = 5;
const snakeLength = 10;
let score = 0;
let zoom = 1;
let snake;
let diff;
let counterBall = 0;
let randDir = p5.Vector.random2D().mult(3);
let timer = 0;


//new ai cool stuff
let video;
let label = 'waiting...';
let classifier;

function preload(){
  classifier = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/DiPlD0y20/model.json');
}



function setup() {

    createCanvas(windowWidth - 20, windowHeight - 20);

//ai
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
    aiSnake = new AISnake(width / 3, 2 * height / 3);
    snakes.push(aiSnake);
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

//ai


function draw() {
    background(220, 0, 15);
    image(video, 0, 0,50,50);
    text(label, 10,50);
    console.log("it is working")

    textSize(32);
    fill(255);



    textSize(14);
    fill(95);
    score = snake.length;
    text("Your length: " + snake.length, 20, height - 20);

    translate(width / 2, height / 2);
    let newzoom = (40 / (snake.size + 40));
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    translate(-snake.pos.x, -snake.pos.y);

   // while (snakes.length < 5) { 
     for (let i = 0; i < numSnakes; i++) {
      snakes.push(new AISnake(random(width), random(height)));  
      snakes[i].draw();
     }
        
    // }

    for (let i = 0; i < dots.length; i++) {
        dots[i].float();
        dots[i].display();

        for (var aiSnake of snakes) {
            if (aiSnake.eatsBlob(dots[i])) {
                diff = floor(dots[i].r / 3);
                score += diff;
                aiSnake.length += diff;
                for (let j = 0; j < diff; j++)
                  aiSnake.addTailSegment(); 
                if (aiSnake.length % 20 == 0)
                  aiSnake.size += diff;
                dots.splice(i, 1);
            }
        }
        if (snake.eatsBlob(dots[i])) {
            diff = floor(dots[i].r / 3);
            snake.length += diff;
            for (let j = 0; j < diff; j++)
              snake.addTailSegment(); 
            if (snake.length % 20 == 0)
              snake.size = floor(snake.length / 20);
            dots.splice(i, 1);
        }
    }

    snake.draw();
}

class BouncyDot {
    constructor(x, y, r, color, baseXVelocity, baseYVelocity) {
        // Randomly generate position
        this.x = random(-width * 20, width * 20);
        this.y = random(-height * 20, height * 20);
        // Randomly generate radius
        this.r = random(3, 10);
        // Randomly generate color
        this.color = random(360);
        // Randomly generate a master velocity (broken into components)...
        this.baseXVelocity = random(0, 0.5);
        this.baseYVelocity = random(0, 0.5);
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
        fill(this.color, 70, 100);
        noStroke();
        ellipse(this.x, this.y, this.r * 2);
    }
}

class AISnake {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.size = 0;
        this.arr = [];
        this.length = 10;

        this.color = random(360);
        this.sat = random(20,100);

        this.arr.push(new TailSegment(this.pos.x, this.pos.y));
        for (let i = 1; i < this.length; i++) {
           this.arr.push(new TailSegment(this.arr[i - 1].pos.x, this.arr[i - 1].pos.y));
        }
    }

    draw() {
        if (frameCount > 0 && frameCount % 90 == 0) {
            randDir = createVector(random(width) - width / 2, random(height) - height / 2);
            // console.log(mouseX);
            // console.log(mouseY);
            // p5.Vector.random2D().mult(3);
        }
        randDir.setMag(3);
        this.vel.lerp(randDir, 0.2);
        this.pos.add(this.vel);

        this.arr[0].pos.x = this.pos.x;
        this.arr[0].pos.y = this.pos.y;

        for (let i = this.arr.length - 1; i >= 1; i--) {
            this.arr[i].pos.x = this.arr[i - 1].pos.x;
            this.arr[i].pos.y = this.arr[i - 1].pos.y;
            this.drawBody(this.arr[i].pos.x, this.arr[i].pos.y, i);
        }
        this.drawHead();
    }

    drawBody(x, y, i) {
        let radius = this.length - (i * 0.01);
        if (radius < 0) radius = 1;
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
        ellipse(x - 9 + eyeX1 - this.size/4, y + eyeY1, 18 + this.size / 2);
        ellipse(x + 9 + eyeX1 + this.size/4, y + eyeY1, 18 + this.size / 2);

        // pupils
        fill(0);
        ellipse(x - 9 + eyeX - this.size/4, y + eyeY, 10 + this.size / 4);
        ellipse(x + 9 + eyeX + this.size/4, y + eyeY, 10 + this.size / 4);
    }

    eatsBlob(blob) {
        return collideCircleCircle(this.pos.x, this.pos.y, 50, blob.x, blob.y, blob.r);
    }

    addTailSegment() {
      this.arr.push(new TailSegment(this.arr[this.arr.length - 1].pos.x, this.arr[this.arr.length - 1].pos.y));
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
        var newvel = createVector(mouseX - width / 2, mouseY - height / 2);
        if (mouseIsPressed && this.length >= 10) {
          newvel.setMag(6);
          if (timer % 20 == 0) this.removeTailSegment();
          timer += 1;
        }
        else newvel.setMag(3);
        this.vel.lerp(newvel, 0.2);
        this.pos.add(this.vel);

        this.arr[0].pos.x = this.pos.x;
        this.arr[0].pos.y = this.pos.y;

        // if (mouseIsPressed && this.length >= 10)
          // this.drawGlow();

        for (let i = this.arr.length - 1; i >= 1; i--) {
            this.arr[i].pos.x = this.arr[i - 1].pos.x;
            this.arr[i].pos.y = this.arr[i - 1].pos.y;
            this.drawBody(this.arr[i].pos.x, this.arr[i].pos.y, i);
        }
        this.drawHead();
        
    }

    drawBody(x, y, i) {
        let radius = this.length - (i * 0.01);
        // console.log(radius);
        // console.log(x);
        // console.log(y);
        if (radius < 0) radius = 1;
        
        
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
        ellipse(x - 9 + eyeX1 - this.size/4, y + eyeY1, 18 + this.size / 2);
        ellipse(x + 9 + eyeX1 + this.size/4, y + eyeY1, 18 + this.size / 2);

        // pupils
        fill(0);
        ellipse(x - 9 + eyeX - this.size/4, y + eyeY, 10 + this.size / 4);
        ellipse(x + 9 + eyeX + this.size/4, y + eyeY, 10 + this.size / 4);
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

        let collide = collideCircleCircle(this.pos.x, this.pos.y, 40 + this.size, otherSnake.arr[i].pos.x, otherSnake.arr[i].pos.x, 40 + otherSnake.size);

        if (collide) this.destroy();

      }

    }

    destroy() {

        for (let i = 0; i < this.arr.size; i++) {

          dots.push(new BouncyDot(this.arr[i].pos.x, this.arr[i].pos.y, r, color, baseXVelocity, baseYVelocity));

        }
      

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
