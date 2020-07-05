import Matter from 'matter-js';
import Wall from './Wall';

let walls = 0;

export const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateWall = () => {
    let topWallHeight = randomBetween(100, Constants.MAX_HEIGHT / 2 - 100);
    let bottomWallHeight = Constants.MAX_HEIGHT - topWallHeight - Constants.GAP_SIZE;

    let sizes = [topWallHeight, bottomWallHeight];

    if (Math.random() < 0.5) {
        sizes = sizes.reverse();
    }

    return sizes;
};

export const addWallsAtLocation = (x, world, entities) => {
    let [wall1Height, wall2Height] = generateWall();

    let wallTop = Matter.Bodies.rectangle(x, wall1Height / 2, Constants.WALL_WIDTH, wall1Height, {
        isStatic: true
    });

    let wallBottom = Matter.Bodies.rectangle(
        x,
        Constants.MAX_HEIGHT - 30 - wall2Height / 2,
        Constants.WALL_WIDTH,
        wall2Height,
        { isStatic: true }
    );

    Matter.World.add(world, [wallTop, wallBottom]);

    entities['wall' + (walls + 1)] = {
        body: wallTop,
        renderer: Wall,
        scored: false
    };

    entities['wall' + (walls + 2)] = {
        body: wallBottom,
        renderer: Wall,
        scored: false
    };

    walls += 2;
};

const Physics = (entities, { touches, time, dispatch }) => {
    let engine = entities.physics.engine;
    let world = entities.physics.world;
    let pot = entities.pot.body;

    let hadTouches = false;
    touches.filter(t => t.type === 'press').forEach(t => {
        if (!hadTouches) {
            if (world.gravity.y === 0.0) {
                world.gravity.y = 1.2;

                addWallsAtLocation(
                    Constants.MAX_WIDTH * 2 - Constants.WALL_WIDTH / 2,
                    world,
                    entities
                );
                addWallsAtLocation(
                    Constants.MAX_WIDTH * 3 - Constants.WALL_WIDTH / 2,
                    world,
                    entities
                );
            }
            hadTouches = true;
            Matter.Body.setVelocity(pot, {
                x: pot.velocity.x,
                y: -10
            });
        }
    });

    Matter.Engine.update(engine, time.delta);

    Object.keys(entities).forEach(key => {
        if (key.indexOf('wall') === 0 && entities.hasOwnProperty(key)) {
            Matter.Body.translate(entities[key].body, { x: -2, y: 0 });

            if (parseInt(key.replace('wall', '')) % 2 === 0) {
                if (entities[key].body.position.x <= pot.position.x && !entities[key].scored) {
                    entities[key].scored = true;
                    dispatch({ type: 'score' });
                }

                if (entities[key].body.position.x <= -1 * (Constants.WALL_WIDTH / 2)) {
                    let wallIndex = parseInt(key.replace('wall', ''));
                    delete entities['wall' + (wallIndex - 1)];
                    delete entities['wall' + wallIndex];
                    addWallsAtLocation(
                        Constants.MAX_WIDTH * 2 - Constants.WALL_WIDTH / 2,
                        world,
                        entities
                    );
                }
            }
        } else if (key.indexOf('floor') === 0) {
            if (entities[key].body.position.x <= -1 * Constants.MAX_WIDTH / 2) {
                Matter.Body.setPosition(entities[key].body, {
                    x: Constants.MAX_WIDTH + Constants.MAX_WIDTH / 2,
                    y: entities[key].body.position.y
                });
            } else {
                Matter.Body.translate(entities[key].body, { x: -2, y: 0 });
            }
        }
    });

    return entities;
};

export default Physics;