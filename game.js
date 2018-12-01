<<<<<<< HEAD
var assets = {
    "sprites": {
        "assets/SpriteMap.png": {
            tile: 32,
            tileh: 32,
            map: {
                prophet_stand_right: [0, 0],
                npc_stand_right: [0, 2],
                tile_Wall0: [0, 9],
                tile_Wall1: [1, 9],
                tile_Wall2: [2, 9],
                tile_Wall3: [3, 9],
                tile_Wall4: [4, 9],
                tile_Wall5: [5, 9],
                tile_Wall6: [6, 9],
                tile_Wall7: [7, 9],
                tile_Wall8: [8, 9],
                tile_Wall9: [9, 9],
                tile_Wall10: [10, 9],
                tile_Wall11: [11, 9],
                tile_Wall12: [12, 9],
                tile_Wall13: [13, 9],
                tile_Wall14: [14, 9],
                tile_Wall15: [15, 9],
                tile_Wall16: [16, 9],
                tile_Wall17: [17, 9],
                tile_Wall18: [18, 9],
                tile_Wall19: [19, 9]
            }
=======
var assets = function() {
    var sprite_map = {
        prophet_stand_right: [0, 0],
        npc_stand_right: [0, 2]
    };

    for (var row = 0; row < 10; row++) {
        for (var col = 0; col < 20; col++) {
            var wall_num = row * 20 + col;
            var wall_pos = [col, row + 10];
            sprite_map['tile_Wall' + wall_num] = wall_pos;
>>>>>>> b9660e942bdf4e89c6ab34bd39b7377046628e12
        }
    }

    return {
        "sprites": {
            "assets/SpriteMap.png": {
                tile: 32,
                tileh: 32,
                map: sprite_map
            }
        },
        "images": ["assets/bg-beach.png"]
    };
}();

var consts = {
    tile_width: 32,
    tile_height: 32,
    level_width: 30,
    level_height: 20,
    anim_fps: 12,
    scale: 1 / window.devicePixelRatio,
    full_screen_ratio: 0.95,
    zoom_level: 3,
    prophet_walk_speed: 120,
    prophet_jump_speed: 300
};

function addReel(entity, anim_name, num_frames, first_frame_col, first_frame_row)
{
    var frames = [];
    for (var col = first_frame_col; col < first_frame_col + num_frames; col++) {
        frames.push([col, first_frame_row]);
    }

    entity.reel(anim_name, 1000 * num_frames / consts.anim_fps, frames);
}

var level = {
    render: function(level) {
        Crafty.e('2D, DOM, Image')
            .attr({x: 0, y: 0})
            .image('assets/bg-beach.png');

        for (var i = 0; i < consts.level_height - 1; i++) {
            this.addOuterWall(0, i, 1,'tile_wall0');
            this.addOuterWall(consts.level_width - 1, i, 1,'tile_wall0');
        }
        var objects = stages[0].stages[level].objects;
        for(var i=0;i<objects.length;i++){
            if(objects[i].type == 'Wall'){
                this.addWall(objects[i].x, objects[i].y, 'tile_' + objects[i].type +''+objects[i].spriteindex);
            }else if (objects[i].type == 'Prophet') {
              var prophet = this.addProphet(objects[i].x, objects[i].y);
              Crafty.viewport.follow(prophet, 0, 0);
            }else if(objects[i].type == 'NPC'){
                this.addNPC(objects[i].x, objects[i].y);
            }
        }
    },

    addEntity: function(entity_type, tiles_x, tiles_y, tiles_width, tiles_height, tile_type)
    {
        return Crafty.e(entity_type, tile_type)
            .attr({x: tiles_x * consts.tile_width,
                   y: tiles_y * consts.tile_height,
                   w: tiles_width * consts.tile_width,
                   h: tiles_height * consts.tile_height});
    },

    addFloor: function(tiles_x, tiles_y, floorType)
    {
        floor = this.addEntity('Floor', tiles_x, tiles_y, 1, 1, floorType);
    },

    addWall: function(tiles_x, tiles_y, floorType)
    {
        wall = this.addEntity('Wall', tiles_x, tiles_y, 1, 1, floorType);
    },
    addOuterWall: function(tiles_x, tiles_y, floorType)
    {
        Crafty.e('Wall', floorType)
            .attr({x: tiles_x * consts.tile_width,
                   y: tiles_y * consts.tile_height,
                   w: 1,
                   h: 32});
    },
    addProphet: function(tiles_x, tiles_y)
    {
        return this.addEntity('Prophet', tiles_x, tiles_y, 1, 1);
    },

    addNPC: function(tiles_x, tiles_y)
    {
        this.addEntity('NPC', tiles_x, tiles_y, 1, 1);
    }
};

function initComponents()
{
    Crafty.c('Floor', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking');
        }
    });

    Crafty.c('Wall', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking, move_blocking');
        }
    });

    Crafty.c('Prophet', {
        init: function() {
            this.addComponent('2D, DOM, prophet_stand_right, SpriteAnimation, Multiway, Jumper, Gravity, Collision, Keyboard');
            addReel(this, 'stand_right', 10, 0, 0);
            addReel(this, 'walk_right', 7, 11, 0);
            addReel(this, 'jump_right', 1, 17, 0);
            addReel(this, 'fall_right', 1, 18, 0);
            addReel(this, 'stand_left', 10, 0, 1);
            addReel(this, 'walk_left', 7, 11, 1);
            addReel(this, 'jump_left', 1, 17, 1);
            addReel(this, 'fall_left', 1, 18, 1);
            this.multiway({x: consts.prophet_walk_speed},
                {RIGHT_ARROW: 0,
                 LEFT_ARROW: 180,
                 D: 0,
                 A: 180});
            this.jumper(consts.prophet_jump_speed, [Crafty.keys.UP_ARROW, Crafty.keys.W]);
            this.gravity('gravity_blocking');

            this.current_direction = 'right';
            this.animate('stand_right', -1);

            this.bind('NewDirection', this.onNewDirection);
            this.bind('Move', this.onMove);
            this.bind('KeyDown', this.onKeyDown);
            this.bind('KeyUp', this.onKeyUp);
        },

        onNewDirection: function(direction) {
            if (direction.y == 0) {
                if (direction.x == 1) {
                    this.current_direction = 'right';
                    this.animate('walk_right', -1);
                }
                else if (direction.x == -1) {
                    this.current_direction = 'left';
                    this.animate('walk_left', -1);
                }
                else { // direction.x == 0
                    if (this.current_direction == 'right') {
                        this.animate('stand_right', -1);
                    }
                    else {
                        this.animate('stand_left', -1);
                    }
                }
            }
            else {
                if (direction.x == 1) {
                    this.current_direction = 'right';
                }
                else if (direction.x == -1) {
                    this.current_direction = 'left';
                }

                if (direction.y == -1) {
                    this.animate('jump_' + this.current_direction, -1);
                }
                else if (direction.y == 1) {
                    this.animate('fall_' + this.current_direction, -1);
                }
            }
        },

        onMove: function(evt) {
            if (this.fixing_position) return;
            var hitDatas;

            if (hitDatas = this.hit('move_blocking')) {
                var hitData = hitDatas[0];
                this.fixing_position = true;
                this.x = evt._x;
                if (this.vy < 0 && evt._y >= hitData.obj.y + hitData.obj.h &&
                    ((evt._x >= hitData.obj.x && evt._x < hitData.obj.x + hitData.obj.w)
                    || (evt._x + consts.tile_width - 1 >= hitData.obj.x
                        && evt._x + consts.tile_width - 1 < hitData.obj.x + hitData.obj.w)))
                {
                    this.vy = 0;
                    this.y = evt._y;
                }
                this.fixing_position = false;
            }
        },

        onKeyDown: function(e) {
            if (e.key == Crafty.keys.Z) {
                var zoom_out_level = Math.min(window.innerWidth / 960, window.innerHeight / 640);
                Crafty.viewport.scale(zoom_out_level);
            }
        },

        onKeyUp: function(e) {
            if (e.key == Crafty.keys.Z) {
                Crafty.viewport.scale(consts.scale * consts.zoom_level);
            }
        }
    });

    Crafty.c('NPC', {
        init: function() {
            this.addComponent('2D, DOM, npc_stand_right, SpriteAnimation, Twoway, Gravity, Collision');
            this.gravity("gravity_blocking");
            this.bind('hitOff',this.turnToBeleiver);
            addReel(this, 'npc_stand_right',1,0,2);
            this.animate('npc_stand_right', -1);
        },

        turnToBeleiver: function(evt)
        {
            var hitData = this.hit('');
        }
    });
}

function initGame()
{
    Crafty.init(window.innerWidth * consts.full_screen_ratio,
                window.innerHeight * consts.full_screen_ratio,
                document.getElementById('game'));
    Crafty.viewport.scale(consts.scale * consts.zoom_level);
    Crafty.pixelart(true);
    Crafty.load(assets, function() {
        initComponents();
        level.render(0);
    });
}

initGame();
