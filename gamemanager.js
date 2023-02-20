/**
 * The class for managing game function
 * @author Toan Nguyen 
 */
class GameManager {

    /**
     * Creates a new game session
     * 
     * @param {*} game the game engine
     */
    static CHEAT = "";

    constructor(game, ctx) {
        Object.assign(this, { game, ctx});
        
        this.gameOver = false;
        //Add main character
        this.mainCharacter =  new Starship(game, params.CANVAS_SIZE / 2, params.CANVAS_SIZE / 2);
        this.entities = [this.mainCharacter];
        this.score = 0;

        this.totalAsteroids = 0;

        this.difficulty = 1;
        this.difficultyThreshold = 15;
        this.asteroids = [];
         
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    spawningAsteroid(){
        let spawningCoordinate = [
            {x: randomInt(params.CANVAS_SIZE), y: 0},
            {x: 0, y: randomInt(params.CANVAS_SIZE)},
            {x:  params.CANVAS_SIZE, y: randomInt(params.CANVAS_SIZE)},
            {x:  randomInt(params.CANVAS_SIZE), y: 0},
        ];

        if (this.totalAsteroids < this.difficultyThreshold){
            let sPoint = randomInt(4);
            let asteroid = new Asteroid(this.game, spawningCoordinate[sPoint].x, spawningCoordinate[sPoint].y, randomInt(10) + 5);
            this.addEntity(asteroid);
            this.totalAsteroids++;
        }
       

    }

    cleanUpBullet(){
        this.entities.forEach(bullet => {
            if (bullet instanceof Bullet && !bullet.isDying){
                if (bullet.x1 - Bullet.BULLET_LENGTH * 3 >= params.CANVAS_SIZE || bullet.x1 + Bullet.BULLET_LENGTH * 3 <= 0 ||
                    bullet.y1 - Bullet.BULLET_LENGTH * 3 >= params.CANVAS_SIZE || bullet.y1 + Bullet.BULLET_LENGTH * 3 <= 0 ||
                    bullet.x2 - Bullet.BULLET_LENGTH * 3 >= params.CANVAS_SIZE || bullet.x2 + Bullet.BULLET_LENGTH * 3 <= 0 ||
                    bullet.y2 - Bullet.BULLET_LENGTH * 3 >= params.CANVAS_SIZE || bullet.y2 + Bullet.BULLET_LENGTH * 3 <= 0
                    ){
                    
                    bullet.removeFromWorld = true;
                }
               
            }
        });
    }

    cleanUpAsteroid(){
        this.entities.forEach(asteroid => {
            if (asteroid instanceof Asteroid && !asteroid.isDying){
                if (asteroid.x - asteroid.radius * 3 >= params.CANVAS_SIZE || asteroid.x + asteroid.radius * 3 <= 0 ||
                    asteroid.y - asteroid.radius * 3 >= params.CANVAS_SIZE || asteroid.y + asteroid.radius * 3 <= 0
                    ){
                    
                    asteroid.removeFromWorld = true;
                    this.totalAsteroids--;
                }
                
                if (GameManager.CHEAT != "TOAN")
                    asteroid.checkCollisionPlayer();
            }
            
        });
    }

    increaseDifficulty(){
        this.difficulty ++;
        this.difficultyThreshold += 2;
    }

    update() {
        this.spawningAsteroid();

      

        if ((parseInt(this.score) >= 5 * this.difficulty)){
            //console.log("Seem ez, let's pump the difficulty up a bit!", parseInt(this.score));
            this.increaseDifficulty();
        }

        if (!this.mainCharacter.isDying && !this.gameOver)
            this.score += 0.005;

        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        this.cleanUpAsteroid();
        this.cleanUpBullet();

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    drawGameOver(ctx) {
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.font = "58px serif";
        ctx.strokeText("Game Over, Press S to play again!", params.CANVAS_SIZE / 2 - 150, params.CANVAS_SIZE / 2);
        ctx.fill();
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.closePath();
    }

    draw(ctx){
        ctx.beginPath();
         //Displaying the score
         ctx.fillStyle = "black";
         ctx.strokeStyle = "black";
         ctx.font = "28px serif";
         ctx.fillText("Score: " + this.score.toFixed(0), 10, 35);

        if (this.gameOver) {
            this.drawGameOver(this.ctx);
            return;
        }

        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }
        ctx.closePath();
       
    };
};

