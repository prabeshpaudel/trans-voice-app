import * as React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

const FLASK_BACKEND = "http://your-flask-ip:5000/audio";

export default function App() {
  const [recording, setRecording] = React.useState();
  const [text, setText] = React.useState("");

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".mp4",
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        },
        ios: {
          extension: ".wav",
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
        },
      });
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    try {
      const response = await FileSystem.uploadAsync(
        FLASK_BACKEND,
        uri
      );
      const body = JSON.parse(response.body);
      setText(body.text);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});