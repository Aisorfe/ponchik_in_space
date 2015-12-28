;(function main(){
    window.onload = function() {
        new Game("screen");
    }

    // ===================== classes =====================

    // game

    var Game = function(canvas_id) {
        var self = this;
        var canvas = document.getElementById(canvas_id);
        var sprite_sheet = new Image();

        this.ctx = canvas.getContext("2d");
        this.screen_size = { width: canvas.width, height: canvas.height };
        this.elements = [];
        this.frames = 0;
        this.sprites = {};
        this.states = {menu: 0, game: 1, game_over: 2};
        this.current_state = this.states.menu;
        sprite_sheet.src = "res/sheet.png";

        sprite_sheet.onload = function() {
            Sprite.init(sprite_sheet, self.sprites);
            self.elements.push(new Background(self), new Player(self));
            loop(this.ctx, this.screen_size);
        }

        var loop = function() {
            self.frames++;
            self.update();
            self.draw(this.ctx, this.screen_size);
            requestAnimationFrame(loop);
        }
    }

    Game.prototype = {
        update: function() {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].update();
            }
        },

        draw: function(ctx, screen_size) {
            this.ctx.clearRect(0, 0, this.screen_size.width, this.screen_size.height);

            for (var i = 0; i < this.elements.length; i++) {
                var e = this.elements[i];
                e.draw(this.ctx);
            }
        }
    }

    // player

    var Player = function(game) {
        this.game = game;
        this.position = {x: 40, y: 0};
        this.sprite = game.sprites.player;
        this.states = {floating: 0, falling: 1};
        this.current_state = this.states.floating;
    }

    Player.prototype = {
        update: function() {
            if (this.current_state == this.states.floating) {
                this.position.y = this.game.screen_size.height / 2 - this.sprite.width / 2
                    + 8 * Math.cos(this.game.frames / 10);
            }
        },

        draw: function(ctx) {
            this.sprite.draw(ctx, this.position.x, this.position.y);
        }
    }

    // background

    var Background = function(game) {
        this.color = "#2f2f2f";
        this.game = game;
        this.stars = [];
        this.star_interval_range = {min: 2, max: 200};
        this.speed = 2;
        this.init_star_num = 10;

        for (var i = 0; i < this.init_star_num; i++) {
            var star = new Star(this.game);
            star.position.x = get_random_int(0, this.game.screen_size.width - star.size);
            this.stars.push(star);
        }
    }

    Background.prototype = {
        update: function() {
            if (this.game.frames % get_random_int(this.star_interval_range.min, 
                    this.star_interval_range.max) == 0)
                this.add_star();

            for (var i = 0; i < this.stars.length; i++) {
                var star = this.stars[i];
                star.update(this.speed);

                if (star.position.x + star.size < 0)
                    this.stars.splice(i, 1);
            }
        },

        draw: function(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, this.game.screen_size.width, this.game.screen_size.height);

            for (var i = 0; i < this.stars.length; i++) {
                var star = this.stars[i];
                ctx.fillStyle = "#fff";
                ctx.fillRect(star.position.x, star.position.y, star.size, star.size);
            }
        },

        add_star: function() {
            var star = new Star(this.game);
            this.stars.push(star);
        }
    }

    // star

    var Star = function(game) {
        this.game = game;
        this.size_range = {min: 2, max: 12};
        this.size = get_random_int(this.size_range.min, this.size_range.max);
        this.x = this.game.screen_size.width;
        this.y = get_random_int(0, this.game.screen_size.height - this.size);
        this.position = {x: this.x, y: this.y};
    }

    Star.prototype = {
        update: function(speed) {
            this.position.x -= speed;
        }
    }

    // sprite

    var Sprite = function(img, x, y, width, height) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    Sprite.prototype = {
        draw: function(ctx, x, y) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height,
            x, y, this.width, this.height);
        }
    }

    Sprite.init = function(img, sprites) {
        sprites["bg"] = new Sprite(img, 0, 50, 960, 370);
        sprites["player"] = new Sprite(img, 0, 0, 73, 50);
        sprites["heart"] = new Sprite(img, 135, 2, 18, 16);
        sprites["heart_off"] = new Sprite(img, 155, 2, 18, 16);
        sprites["donuts"] = [
            new Sprite(img, 75, 2, 18, 18),
            new Sprite(img, 95, 2, 18, 18),
            new Sprite(img, 115, 2, 18, 18),
            new Sprite(img, 75, 22, 18, 18),
            new Sprite(img, 95, 22, 18, 18),
            new Sprite(img, 115, 22, 18, 18),
        ];
        sprites["chars"] = {
            "0": new Sprite(img, 243, 2, 6, 10),
            "1": new Sprite(img, 173, 2, 6, 10),
            "2": new Sprite(img, 179, 2, 6, 10),
            "3": new Sprite(img, 187, 2, 6, 10),
            "4": new Sprite(img, 195, 2, 6, 10),
            "5": new Sprite(img, 203, 2, 6, 10),
            "6": new Sprite(img, 211, 2, 6, 10),
            "7": new Sprite(img, 219, 2, 6, 10),
            "8": new Sprite(img, 227, 2, 6, 10),
            "9": new Sprite(img, 235, 2, 6, 10),
            "a": new Sprite(img, 175, 14, 6, 10),
            "b": new Sprite(img, 183, 14, 6, 10),
            "c": new Sprite(img, 191, 14, 6, 10),
            "d": new Sprite(img, 199, 14, 6, 10),
            "e": new Sprite(img, 207, 14, 6, 10),
            "f": new Sprite(img, 215, 14, 6, 10),
            "g": new Sprite(img, 223, 14, 6, 10),
            "h": new Sprite(img, 231, 14, 6, 10),
            "i": new Sprite(img, 239, 14, 6, 10),
            "j": new Sprite(img, 247, 14, 6, 10),
            "k": new Sprite(img, 255, 14, 6, 10),
            "l": new Sprite(img, 263, 14, 6, 10),
            "m": new Sprite(img, 271, 14, 6, 10),
            "n": new Sprite(img, 279, 14, 6, 10),
            "o": new Sprite(img, 287, 14, 6, 10),
            "p": new Sprite(img, 295, 14, 6, 10),
            "q": new Sprite(img, 303, 14, 6, 10),
            "r": new Sprite(img, 311, 14, 6, 10),
            "s": new Sprite(img, 319, 14, 6, 10),
            "t": new Sprite(img, 327, 14, 6, 10),
            "u": new Sprite(img, 335, 14, 6, 10),
            "v": new Sprite(img, 343, 14, 6, 10),
            "w": new Sprite(img, 351, 14, 6, 10),
            "x": new Sprite(img, 359, 14, 6, 10),
            "y": new Sprite(img, 367, 14, 6, 10),
            "z": new Sprite(img, 375, 14, 6, 10),
            " ": new Sprite(img, 383, 14, 6, 10)
        };
    }

    // ===================== helper functions =====================

    function get_random_int(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
})();