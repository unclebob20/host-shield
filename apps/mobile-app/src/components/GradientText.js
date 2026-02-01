import React from 'react';
import { Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const GradientText = ({ style, children }) => {
    return (
        <MaskedView
            maskElement={
                <Text style={[style, { backgroundColor: 'transparent' }]}>
                    {children}
                </Text>
            }
        >
            <LinearGradient
                colors={['#0e7490', '#7c3aed']} // Cyan-700 to Violet-600 approx matching the image
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={[style, { opacity: 0 }]}>
                    {children}
                </Text>
            </LinearGradient>
        </MaskedView>
    );
};

export default GradientText;
