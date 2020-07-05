import React, { Component } from 'react';
import { View, Image } from 'react-native';
import Images from './assets/Images';

export default class Wall extends Component{
    render(){
        const width = this.props.body.bounds.max.x - this.props.body.bounds.min.x;
        const height = this.props.body.bounds.max.y - this.props.body.bounds.min.y;
        const x = this.props.body.position.x - width / 2;
        const y = this.props.body.position.y - height / 2;
        
        const wallRatio = 100 / width;
        const wallHeight = 100 * wallRatio;
        const wallIterations = Math.ceil(height / wallHeight);
        
        return(
            <View
                style={{
                    position: 'absolute',
                    top: y,
                    left: x,
                    width: width,
                    height: height,
                    overflow: 'hidden',
                    flexDirection: 'column'
                }}>
                
                {Array.apply(null, Array(wallIterations)).map((el, idx) => {
                    return <Image style={{ width: width, height: wallHeight }} key={idx} resizeMode="stretch" source={Images.wall} />
                })}                
                
            </View>     
        )
    }
}