import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';

export default function CustomButton({ text, onPress, color, textColor}) {
    const styles = StyleSheet.create({
        button: {
            borderRadius: 8,
            paddingVertical: 14,
            paddingHorizontal: 10,
            backgroundColor: color,
            margin: 10,
            width: 200
        },
        buttonText: {
            color: textColor,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: 16,
            textAlign: 'center',
        }
    })

    return (
        <TouchableOpacity onPress = {onPress}>
            <View style={styles.button}>
                <Text style = {styles.buttonText}>{ text }</Text>
            </View>
        </TouchableOpacity>
    )
}
