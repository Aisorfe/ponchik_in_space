;(function main(){
    window.onload = function() {

        new Game("screen");
    }

    // ========================= classes ==========================

    // game

    var Game = function(canvas_id) {
        var self = this;
        var canvas = document.getElementById(canvas_id);
        var sprite_sheet = new Image();

        this.ctx = canvas.getContext("2d");
        this.screen_size = { width: canvas.width, height: canvas.height };
        this.frames = 0;
        this.sprites = {};
        this.states = {menu: 0, game: 1, game_over: 2};
        this.current_state = this.states.menu;
        this.score = 0;
        sprite_sheet.src = "res/sheet.png";

        sprite_sheet.onload = function() {
            Sprite.init(sprite_sheet, self.sprites);
            self.elements = {background: new Background(self), player: new Player(self), donut_field: new DonutField(self)};
            loop(this.ctx, this.screen_size);
        }

        var loop = function() {
            self.frames++;
            self.update();
            self.draw();
            requestAnimationFrame(loop);
        }
    }

    Game.prototype = {
        update: function() {
            for (e in this.elements)
                this.elements[e].update();
        },

        draw: function() {
            this.ctx.clearRect(0, 0, this.screen_size.width, this.screen_size.height);

            for (e in this.elements)
                this.elements[e].draw(this.ctx);
        }
    }

    // player

    var Player = function(game) {
        this.game = game;
        this.lifes_max = 3;
        this.lifes = 3;
        this.position = {x: 40, y: 0};
        this.sprite = game.sprites.player;
        this.l_sprites = {on: game.sprites.heart, off: game.sprites.heart_off};
        this.states = {pre_game: "pre_game", fall: "game", dead: "dead"};
        this.current_state = this.states.pre_game;
        this.vel = 0;
        this.jump_h = 6;
        this.gravity = 0.3;
        this.rotation = 0;

        var self = this;
        
        document.addEventListener("mousedown", function() {
            self.handler();
        });
    }

    Player.prototype = {
        update: function() {
            if (this.current_state != this.states.dead) {
                if (this.current_state == this.states.pre_game)
                    this.position.y = this.game.screen_size.height / 2 - this.sprite.width / 2
                        + 8 * Math.cos(this.game.frames / 10);
                else {
                    var rect = this.get_rect();
                    this.vel += this.gravity;
                    this.position.y += this.vel;
                    if (rect.position.y + rect.height < 0 || rect.position.y > this.game.screen_size.height) {
                        if (--this.lifes >= 0)
                            this.current_state = this.states.pre_game;
                        else this.current_state = this.states.dead;
                    }
                }
            }
        },

        draw: function(ctx) {
            if (this.current_state != this.states.dead)
                this.sprite.draw(ctx, this.position.x, this.position.y);

            for (var i = 0; i < this.lifes_max; i++) {
                this.l_sprites.off.draw(ctx, 10 + i * 24, 10);
                if (i < this.lifes) this.l_sprites.on.draw(ctx, 10 + i * 24, 10);
            }
        },

        handler: function() {
            switch (this.current_state) {
                case this.states.pre_game:
                    this.current_state = this.states.game;
                    this.jump();
                    break;
                case this.states.game:
                    this.jump();
                    break;
            }
        },

        jump: function() {
            this.vel = -this.jump_h;
        },

        get_rect: function() {
            return new Rectangle(this.position.x, this.position.y, this.sprite.width, this.sprite.height);
        }
    }

    // donuts

    var DonutField = function(game) {
        this.donuts = [];
        this.intervals = [10, 20, 30, 50, 100];
        this.interval_changing_time = 250;
        this.speed_range = {min: 1, max: 8};
        this.game = game;
    }

    DonutField.prototype = {
        update: function() {
            if ( (this.game.frames % this.interval_changing_time == 0) || (!this.interval) )
                this.interval = get_random_array_element(this.intervals);
            if (this.game.frames % this.interval == 0)
                this.donuts.push(new Donut(this.game, this.speed_range));

            for (var i = 0; i < this.donuts.length; i++) {
                var d = this.donuts[i];
                var p_rect = this.game.elements.player.get_rect();

                if ( (this.game.elements.player.current_state != this.game.elements.player.states.pre_game)
                    && (d.get_center().x > p_rect.position.x)
                    && (d.get_center().x < p_rect.position.x + p_rect.width)
                    && (d.get_center().y > p_rect.position.y)
                    && (d.get_center().y < p_rect.position.y + p_rect.height) ) {
                    d.is_eaten = true;
                    this.game.score += d.speed;
                }

                d.position.x -= d.speed;
                if ( (d.position.x < -d.sprite.width) || (d.is_eaten) )
                    this.donuts.splice(i, 1);
            }
        },

        draw: function(ctx) {
            for (var i = 0; i < this.donuts.length; i++) {
                var d = this.donuts[i];
                d.sprite.draw(ctx, d.position.x, d.position.y);
            }
        }
    }

    var Donut = function(game, speed_range) {
        this.sprite = game.sprites.donuts[get_random_int(0, game.sprites.donuts.length - 1)];
        this.position = {x: game.screen_size.width,
            y: get_random_int(0, game.screen_size.height - this.sprite.width)};
        this.speed = get_random_int(speed_range.min, speed_range.max);
        this.is_eaten = false;
    }

    Donut.prototype = {
        get_center: function() {
            return {x: this.position.x + this.sprite.width / 2,
                y: this.position.y + this.sprite.height / 2};
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
        this.position = {x: x, y: y};
        this.width = width;
        this.height = height;
    }

    Sprite.prototype = {
        draw: function(ctx, x, y) {
        ctx.drawImage(this.img, this.position.x, this.position.y, this.width, this.height,
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

    // rectangle

    var Rectangle = function(x, y, width, height) {
        this.position = {x: x, y: y};
        this.width = width;
        this.height = height;
    }

    // controller 

    var Controller = function() {
        var pressed_keys = {}

        window.onkeydown = function(e) {
            pressed_keys[e.keyCode] = true;
        }

        window.onkeyup = function(e) {
            pressed_keys[e.keyCode] = false;
        }

        this.is_down = function(code) {
            return pressed_keys[code] === true;
        }
    }

    // ===================== helper functions =====================

    function get_random_int(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function get_random_array_element(array) {
        return array[get_random_int(0, array.length - 1)];
    }

})();