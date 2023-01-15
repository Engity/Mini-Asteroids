/**
 * @author Toan Nguyen
 * The main player
 * Display based on geometry
 */
class Starship {
    static RELOAD_SPEED = 75;

    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.center = { x: x, y: y };

        this.radius = 30;
        this.head = { x: x, y: y - this.radius };
        this.leftTail = { x: x - this.radius, y: y };
        this.rightTail = { x: x + this.radius, y: y };

        this.angle = 3 * Math.PI / 2;//Point upward

        //Displacement for x axis
        this.dx = 0;
        //Displacement for the y axis
        this.dy = 0;
        this.forceX = 0;
        this.forceY = 0;

        //Speed constraints
        this.currentSpeed = 0;
        this.maximumSpeed = 250;

        this.currentAcceleration = 0;
        this.acceleration = 0.02;
        this.maximumAcceleration = 1;

        this.activateThruster = false;

        this.isDying = false;
        this.dyingTickAnimation = 0;
        this.thrusters = [];

        this.reload = 0;

    }

    updatePos() {
        this.x += this.dx * this.game.clockTick;
        this.y += this.dy * this.game.clockTick;

        if (this.x + this.radius >= params.CANVAS_SIZE) {
            this.x = 0;
        }
        if (this.x < 0) {
            this.x = params.CANVAS_SIZE - this.radius;
        }

        if (this.y + this.radius >= params.CANVAS_SIZE) {
            this.y = 0;
        }
        if (this.y < 0) {
            this.y = params.CANVAS_SIZE - this.radius;
        }

        this.center = { x: this.x, y: this.y }
        this.head.x = Math.cos(this.angle).toFixed(3) * this.radius + this.x;
        this.head.y = Math.sin(this.angle).toFixed(3) * this.radius + this.y;

        let leftAngle = this.angle + Math.PI / 2;
        let rightAngle = this.angle - Math.PI / 2;
        // if (leftAngle <= 0){
        //     leftAngle = Math.PI * 2;
        // }

        this.leftTail.x = Math.cos(leftAngle).toFixed(3) * this.radius + this.x;
        this.leftTail.y = Math.sin(leftAngle).toFixed(3) * this.radius + this.y;

        this.rightTail.x = Math.cos(rightAngle).toFixed(3) * this.radius + this.x;
        this.rightTail.y = Math.sin(rightAngle).toFixed(3) * this.radius + this.y;

        let mTail = (this.rightTail.y - this.leftTail.y) / (this.rightTail.x - this.leftTail.x);
        if (this.rightTail.x == this.leftTail.x) {
            mTail = 99;
        }
        let thrusterLength = this.radius / 3;

        let tailYInt = this.leftTail.y - mTail * this.leftTail.x;
        // let mReTail = 1/mTail;
        let revAngle = this.angle - Math.PI;
        let beginX = Math.min(this.leftTail.x, this.rightTail.x);
        let endX = Math.max(this.leftTail.x, this.rightTail.x);

        let step = (endX - beginX) / 10;
        if (step == 0) {
            step = 0.1;
        }

        this.thrusters = [];

        for (let i = beginX; i <= endX; i += step) {
            let j = (this.rightTail.x == this.leftTail.x) ? this.rightTail.y : (mTail * i) + tailYInt;

            let newI = Math.cos(revAngle).toFixed(3) * (thrusterLength) + i;
            let newJ = Math.sin(revAngle).toFixed(3) * (thrusterLength) + j;




            let tmp = new Line(this.game);
            tmp.addEndPoints(i, j, newI, newJ);
            this.thrusters.push(tmp);
            
            // //Adding new way to destroy asteroid
            // if (this.game.up) {
            //     this.game.gameManager.entities.forEach(asteroid => {
            //         if (asteroid instanceof Asteroid && !asteroid.removeFromWorld) {
            //             if (asteroid.checkCollisionWithLineSegment(tmp)) {
            //                 asteroid.dying();
            //             }
            //         }
            //     });
            // }

        }

    }

    vectorNormalize(x, y) {
        let mag = Math.sqrt(x ** 2 + y ** 2);
        if (mag == 0)
            return;
        return [x / mag, y / mag];

    }

    //Update movement
    updateMovement() {
        //Rotate counter clockwise
        if (this.game.left || this.game.right) {
            //console.log("Going " + ((this.game.left)? "left ": "right ") + this.center.x + this.center.y + " " + this.head.x + " " + this.head.y + " " + this.game.clockTick);
            //console.log(this.angle);

            this.angle += 0.015 * ((this.game.left) ? -1 : 1);
            this.angle %= Math.PI * 2;

            if (this.angle <= 0) {
                this.angle = Math.PI * 2;
            }
        }

        if (this.game.up) {
            //console.log("Acceleration: " + this.currentAcceleration + " " + this.forceX + " " + this.forceY);

            this.currentAcceleration = Math.sqrt(this.forceX ** 2 + this.forceY ** 2);
            this.currentAcceleration += this.acceleration;

            this.currentAcceleration = Math.max(this.currentAcceleration, 0);
            this.forceX = Math.cos(this.angle).toFixed(4) * this.currentAcceleration;
            this.forceY = Math.sin(this.angle).toFixed(4) * this.currentAcceleration;

            if (this.forceX ** 2 + this.forceY ** 2 > this.maximumAcceleration ** 2) {
                [this.forceX, this.forceY] = this.vectorNormalize(this.forceX, this.forceY);
                this.forceX *= this.maximumAcceleration;
                this.forceY *= this.maximumAcceleration;

                this.currentAcceleration = Math.sqrt(this.forceX ** 2 + this.forceY ** 2);
            }
        }
        else {
            this.currentAcceleration = 0;
            this.forceX = 0;
            this.forceY = 0;
        }

        let newDx = this.dx + this.forceX;
        let newDy = this.dy + this.forceY;

        if (newDx ** 2 + newDy ** 2 > this.maximumSpeed ** 2) {
            [newDx, newDy] = this.vectorNormalize(newDx, newDy);
            this.dx = newDx * this.maximumSpeed;
            this.dy = newDy * this.maximumSpeed;
        }
        else {
            this.dx = newDx;
            this.dy = newDy;
        }
    }

    shoot() {
        if (this.reload <= 0 && this.game.shooting) {
            this.reload = Starship.RELOAD_SPEED;
            let bullet = new Bullet(this.game, this.head.x, this.head.y, this.angle);

            this.game.gameManager.addEntity(bullet);

        }

        this.reload--;
        this.reload = Math.max(this.reload, 0);
    }

    update() {
        if (!this.isDying) {
            //Start to applying force
            this.updateMovement();
            if (this.game.up) {
                this.activateThruster = true;
            }
            else {
                this.activateThruster = false;
            }
            this.updatePos();

            //Shooting
            this.shoot();




        }
        else {
            if (this.dyingTickAnimation <= 0) {
                this.isDying = false;
                this.removeFromWorld = true;
                this.game.gameManager.gameOver = true;
            }
            else {
                --this.dyingTickAnimation;
            }
        }
    }

    dying() {
        if (this.isDying)
            return;
        this.isDying = true;
        this.dyingTickAnimation = 400;
    }


    drawLine(ctx, xStart, yStart, xEnd, yEnd) {
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);

        ctx.fill();
        ctx.stroke();
    }

    drawThruster(ctx) {
        this.thrusters.forEach(thruster => {
            let i = thruster.points[0].x;
            let j = thruster.points[0].y;
            let i2 = thruster.points[1].x;
            let j2 = thruster.points[1].y;
            this.drawLine(ctx, i, j, i2, j2);
        });
    }

    drawDyingAnimation(ctx) {
        //console.log("Radius",  this.dyingTickAnimation + 200);
        ctx.beginPath();

        ctx.fillStyle = "white";
        ctx.strokeStyle = "red";
        //ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        if (this.dyingTickAnimation >= 75) {
            ctx.arc(this.center.x, this.center.y, this.dyingTickAnimation / 400 * this.radius, 0, 2 * Math.PI);
        }
        else
            ctx.arc(this.center.x, this.center.y, this.radius / this.dyingTickAnimation, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }


    draw(ctx) {
        //Draw the line
        ctx.beginPath();

        if (!this.isDying) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "red";
            if (this.shooting && this.reload > 0){
                ctx.fillStyle = "red";
                ctx.strokeStyle = "blue";
            }
            this.drawLine(ctx, this.rightTail.x, this.rightTail.y, this.leftTail.x, this.leftTail.y);
            this.drawLine(ctx, this.head.x, this.head.y, this.leftTail.x, this.leftTail.y);
            this.drawLine(ctx, this.head.x, this.head.y, this.rightTail.x, this.rightTail.y);
            //Drawing thruster
            if (this.activateThruster) {
                this.drawThruster(ctx);
            }
        }
        else {
            this.drawDyingAnimation(ctx);
        }


    }
}