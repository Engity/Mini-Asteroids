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
    constructor(game, ctx) {
        Object.assign(this, { game, ctx});
        
        this.gameOver = false;
        //Add main character
        this.mainCharacter =  new Starship(game, params.CANVAS_SIZE / 2, params.CANVAS_SIZE / 2);
        this.entities = [this.mainCharacter];
        this.score = 0;
        
    };

    addEntity(entity) {
        this.entities.push(entity);
    };


    update() {
        if (!this.mainCharacter.isDying && !this.gameOver)
            this.score += 0.005;

        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }
    };

    drawGameOver(ctx) {
        ctx.font = "58px serif";
        ctx.strokeText("Game Over, Press S to play again!", params.CANVAS_SIZE / 2 - 450, params.CANVAS_SIZE / 2);
    }

    draw(ctx){
         //Displaying the score
         ctx.font = "28px serif";
         ctx.fillText("Score: " + this.score.toFixed(0), 10, 35);

        if (this.gameOver) {
            this.drawGameOver(this.ctx);
            return;
        }

        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }

       
    };
};

