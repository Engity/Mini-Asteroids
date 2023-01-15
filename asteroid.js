/**
 * Is basically a polygon with n vertexes
 * vertexesNum is the number of vertexes of the asteroids. Should be <= 7 and >= 3
 */
class Asteroid {
    constructor(game, x, y, vertexesNum = 3) {
        Object.assign(this, { game, x, y, vertexesNum});

        //Randomize movement
        this.dx = randomInt(100) - 35;
        this.dy = randomInt(100) - 35;

        this.angle = 3 * Math.PI / 2;
        this.spinning = 2 * Math.PI / 3600 * randomInt(5); //Spinning slightly
        
        this.radius = 30;
        this.center = { x: x, y: y };

        this.dyingTickAnimation = 0;
        this.isDying = false;
        this.vertexes = [];

        //Generate randomize asteroid.
        let randomPool = [...Array(360).keys()];
        this.shuffleArray(randomPool);

        this.anglePool = [];
        for (let i = 0 ; i < vertexesNum; i++){
            let radianAngle = randomPool[i] / 180 * Math.PI;
            this.anglePool.push(radianAngle);
        }
        this.anglePool.sort((a, b) => a - b);

        

        for (let i = 0 ; i < vertexesNum; i++){
            let x = Math.cos(this.anglePool[i]).toFixed(3) * this.radius + this.x;
            let y = Math.sin(this.anglePool[i]).toFixed(3) * this.radius + this.y;
            this.vertexes.push({x: x, y: y});
        }
      
        
    }

    /**
     * Shuffle an array
     * @param {*} array the array to be shuffled 
     * @returns the shuffled array
     */
    shuffleArray(array) {
 
        return array.sort( ()=>Math.random()-0.5 );
      
     }

    updatePos() {
        this.x += this.dx * this.game.clockTick;
        this.y += this.dy * this.game.clockTick;

        // if (this.x + this.radius >= params.CANVAS_SIZE) {
        //     this.x = 0;
        // }
        // if (this.x < 0) {
        //     this.x = params.CANVAS_SIZE - this.radius;
        // }

        // if (this.y + this.radius >= params.CANVAS_SIZE) {
        //     this.y = 0;
        // }
        // if (this.y < 0) {
        //     this.y = params.CANVAS_SIZE - this.radius;
        // }

        this.center = { x: this.x, y: this.y }
        this.angle += this.spinning;
        this.angle %= 2 * Math.PI;

        for (let i = 0 ; i < this.vertexesNum; i++){
            this.anglePool[i] += this.spinning;
            this.anglePool[i] %= 2 * Math.PI;
            let x = Math.cos(this.anglePool[i]).toFixed(3) * this.radius + this.x;
            let y = Math.sin(this.anglePool[i]).toFixed(3) * this.radius + this.y;
            
            this.vertexes[i] ={x: x, y: y};
        }

    }

    vectorNormalize(x, y) {
        let mag = Math.sqrt(x ** 2 + y ** 2);
        if (mag == 0)
            return;
        return [x / mag, y / mag];

    }

    update() {
        if (!this.isDying) {
            this.updatePos();
        }
        else {
            if (this.dyingTickAnimation <= 0) {
                this.isDying = false;
                this.removeFromWorld = true;
            }
            else {
                --this.dyingTickAnimation;
            }
        }

        this.updatePos();
    }

    dying() {
        this.isDying = true;
        this.dyingTickAnimation = 400;
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

    drawDyingAnimation(ctx) {
        
        ctx.beginPath();

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        //ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        if (this.dyingTickAnimation > 200) {
            ctx.arc(this.center.x, this.center.y, this.dyingTickAnimation / 400 * this.radius, 0, 2 * Math.PI);
        }
        else
            ctx.arc(this.center.x, this.center.y, this.radius / this.dyingTickAnimation, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }


    draw(ctx) {
        if (!this.isDying) {
            for (let i = 0; i < this.vertexesNum; i++){
                let j = i - 1;
                if (j < 0){
                    j = this.vertexesNum - 1;
                }
                this.drawLine(ctx, this.vertexes[i].x, this.vertexes[i].y,
                    this.vertexes[j].x, this.vertexes[j].y);
            }

        }
        else {
            this.drawDyingAnimation(ctx);
        }
    }
}