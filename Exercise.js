import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class Exercise extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>This is where the exercise description would go!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});