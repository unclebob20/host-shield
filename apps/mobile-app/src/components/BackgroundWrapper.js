import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const BackgroundWrapper = ({ children, style }) => {
    return (
        <ImageBackground
            source={require('../../assets/marketing-bg.png')}
            style={[styles.background, style]}
            resizeMode="cover"
        >
            {children}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#f8fafc', // Fallback/Underlay color
        width: '100%',
        height: '100%',
    },
});

export default BackgroundWrapper;
