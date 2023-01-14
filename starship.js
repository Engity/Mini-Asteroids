class Starship {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.center = { x: x, y: y };
        this.game.mainCharacter = this;
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
        this.maximumSpeed = 300;

        this.currentAcceleration = 0;
        this.acceleration = 1;
        this.maximumAcceleration = 7;

        this.activateThruster = false;

        this.isDying = false;
        this.dyingTickAnimation = 0;

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



        // //Always keep object in frame
        // this.x = Math.min(params.CANVAS_SIZE - this.radius, this.x);
        // this.x = Math.max(0, this.x);

        // this.y = Math.min(params.CANVAS_SIZE - this.radius, this.y);
        // this.y = Math.max(0, this.y);


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

            this.angle += 0.01 * ((this.game.left) ? -1 : 1);
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
        }
        else {
            if (this.dyingTickAnimation <= 0) {
                this.isDying = false;
                this.removeFromWorld = true;
                this.game.gameOver = true;
            }
            else {
                --this.dyingTickAnimation;
            }
        }
        
        console.log(this.dyingTickAnimation);
        
        //Temporary to trigger dead animation
        if (this.game.down) {
            this.isDying = true;
            this.dyingTickAnimation = 400;
        }

    }

    drawLine(ctx, xStart, yStart, xEnd, yEnd) {
        ctx.fillStyle = "Black";
        ctx.strokeStyle = "Black";

        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);

        ctx.fill();
        ctx.stroke();

    }

    drawThruster(ctx) {
        let mTail = (this.rightTail.y - this.leftTail.y) / (this.rightTail.x - this.leftTail.x);
        if (this.rightTail.x == this.leftTail.x) {
            mTail = 99;
        }
        let thrusterLength = this.radius / 5;
        let tailYInt = this.leftTail.y - mTail * this.leftTail.x;
        // let mReTail = 1/mTail;
        let revAngle = this.angle - Math.PI;
        let beginX = Math.min(this.leftTail.x, this.rightTail.x);
        let endX = Math.max(this.leftTail.x, this.rightTail.x);

        let step = (endX - beginX) / 10;
        if (step == 0) {
            step = 0.1;
        }

        for (let i = beginX; i <= endX; i += step) {
            let j = (this.rightTail.x == this.leftTail.x) ? this.rightTail.y : (mTail * i) + tailYInt;

            let newI = Math.cos(revAngle).toFixed(3) * (thrusterLength) + i;
            let newJ = Math.sin(revAngle).toFixed(3) * (thrusterLength) + j;

            this.drawLine(ctx, i, j, newI, newJ);

        }
    }

    drawDyingAnimation(ctx) {
        //console.log("Radius",  this.dyingTickAnimation + 200);
        ctx.beginPath();
        
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        //ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        if (this.dyingTickAnimation > 200){
            ctx.arc(this.center.x, this.center.y, this.radius - this.radius / this.dyingTickAnimation * 100, 0, 2 * Math.PI);
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
            this.drawLine(ctx, this.rightTail.x, this.rightTail.y, this.leftTail.x, this.leftTail.y);
            this.drawLine(ctx, this.head.x, this.head.y, this.leftTail.x, this.leftTail.y);
            this.drawLine(ctx, this.head.x, this.head.y, this.rightTail.x, this.rightTail.y);
        }
        else {
            this.drawDyingAnimation(ctx);
        }

        //Drawing thruster
        if (this.activateThruster) {
            this.drawThruster(ctx);
        }
    }
}