import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import Pot from './Pot';
import Constants from './Constants';
import Physics from './Physics';
import Floor from './Floor';
import Images from './assets/Images';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.gameEngine = null;
        this.entities = this.setupWorld();

        this.state = {
            running: true,
            score: 0
        };
    }

    setupWorld = () => {
        let engine = Matter.Engine.create({ enableSleeping: false });
        let world = engine.world;
        world.gravity.y = 0.0;

        let pot = Matter.Bodies.rectangle(
            Constants.MAX_WIDTH / 2,
            Constants.MAX_HEIGHT / 2,
            Constants.POT_WIDTH,
            Constants.POT_HEIGHT
        );
        let floor1 = Matter.Bodies.rectangle(
            Constants.MAX_WIDTH / 2,
            Constants.MAX_HEIGHT - 25,
            Constants.MAX_WIDTH + 4,
            50,
            { isStatic: true }
        );

        let floor2 = Matter.Bodies.rectangle(
            Constants.MAX_WIDTH + Constants.MAX_WIDTH / 2,
            Constants.MAX_HEIGHT - 25,
            Constants.MAX_WIDTH + 4,
            50,
            { isStatic: true }
        );

        Matter.World.add(world, [pot, floor1, floor2]);

        Matter.Events.on(engine, 'collisionStart', event => {
            let pairs = event.pairs;

            this.gameEngine.dispatch({ type: 'game-over' });
        });

        return {
            physics: { engine: engine, world: world },
            pot: { body: pot, pose: 1, renderer: Pot },
            floor1: { body: floor1, renderer: Floor },
            floor2: { body: floor2, renderer: Floor }
        };
    };

    onEvent = e => {
        if (e.type === 'game-over') {
            this.setState({
                running: false
            });
        } else if (e.type === 'score') {
            this.setState({
                score: this.state.score + 1
            });
        }
    };

    reset = () => {
        this.gameEngine.swap(this.setupWorld());
        this.setState({
            running: true,
            score: 0
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <Image
                    source={Images.background}
                    style={styles.backgroundImage}
                    resizeMode="stretch"
                />
                <GameEngine
                    ref={ref => {
                        this.gameEngine = ref;
                    }}
                    style={styles.gameContainer}
                    systems={[Physics]}
                    running={this.state.runing}
                    onEvent={this.onEvent}
                    entities={this.entities}
                />
                <Text style={styles.score}>{this.state.score}</Text>
                {!this.state.running && (
                    <TouchableOpacity style={styles.fullScreenButton} onPress={this.reset}>
                        <View style={styles.fullScreen}>
                            <Text style={styles.gameOverText}>Game Over</Text>
                            <Text style={styles.gameOverSubText}>Try Again</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: Constants.MAX_WIDTH,
        height: Constants.MAX_HEIGHT
    },
    gameContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    fullScreenButton: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1
    },
    score: {
        position: 'absolute',
        color: 'white',
        fontSize: 72,
        top: 50,
        left: Constants.MAX_WIDTH / 2 - 20,
        textShadowColor: '#444444',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'black',
        opacity: 0.8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    gameOverText: {
        color: 'white',
        fontSize: 48
    },
    gameOverSubText: {
        color: 'white',
        fontSize: 24
    }
});