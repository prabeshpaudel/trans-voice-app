import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button, Text, Pressable, ImageBackground, Image, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from './button';
import * as FileSystem from "expo-file-system";

let recording = new Audio.Recording();
//const image = { uri: 'assets/images/background.png' };
let recordedText = " ";
// let imageUri = {uri:  'https://images.unsplash.com/photo-1615789591457-74a63395c990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZG9tZXN0aWMlMjBjYXR8ZW58MHx8MHx8&w=1000&q=80'};

const FLASK_BACKEND = "http://10.42.224.223:8000/getResult";

export default function Home() {

  const [data, setData] = useState(' ')
  const [text, setText] = React.useState("");
  //const [tempUrl, setTempUrl] = useState('')

  // useEffect(() => {
  //   fetch(FLASK_BACKEND).then(res =>
  //     res.json()
  //   ).then (
  //     data => {
  //       setData(data)
  //       console.log(data)
  //     }
  //   )
  // }, [])

  // useEffect(() => 
  //     fetchResults()
  // , [])
  
  const fetchResults = async () => {
    fetch(FLASK_BACKEND, {method: 'GET'}).then(res =>
      res.json()
    ).then (
      data => {
        setData(data)
        console.log("App is fetching results...")
        // console.log("THIS IS A TEST")
        console.log(data)
      }
    )
  }

  // For the DropDownPicker 
  //------------------------------------------
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {label: 'Exercise 1', value: 'ex1'},
    {label: 'Exercise 2', value: 'ex2'}
  ]);
  //------------------------------------------

  // For the recordbutton color
  const [recordButtonColor, setRecordButtonColor] = useState('black')
  //------------------------------------------
  
  // For the Image
  //------------------------------------------
  const [imageUri, setImageUri] = useState( 
    'https://media.npr.org/assets/img/2021/08/11/gettyimages-1279899488_wide-f3860ceb0ef19643c335cb34df3fa1de166e2761-s1100-c50.jpg'
  );

  const displayResult = async () => {
    // fetchResults()
    //setImageUri(tempUrl);
    console.log("This is printing the result")
    // setImageUri(data["url"])
    // console.log(data["result"]);
    setAnalysisText(text);
  }
  //------------------------------------------

  // For the analysis text
  //------------------------------------------
  const [analysisText, setAnalysisText] = useState(' ')
  //------------------------------------------

  //For the Recording
  //------------------------------------------
  const [RecordedURI, SetRecordedURI] = useState('');
  const [AudioPerm, SetAudioPerm] = useState(false);
  const [isRecording, SetisRecording] = useState(false);
  const [isPLaying, SetisPLaying] = useState(false);
  const Player = useRef(new Audio.Sound());

  useEffect(() => {
    GetPermission();
  }, []);

  const GetPermission = async () => {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      }); 
    const getAudioPerm = await Audio.requestPermissionsAsync();
    SetAudioPerm(getAudioPerm.granted);
  };

  const startRecording = async () => {
    if (AudioPerm === true) {
      try {
        await recording.prepareToRecordAsync({
          //Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
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
        await recording.startAsync();
        SetisRecording(true);
        setRecordButtonColor('red');
      } catch (error) {
        console.log(error);
      }
    } else {
      GetPermission();
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const result = recording.getURI();
      SetRecordedURI(result); // Here is the URI
      recording = new Audio.Recording();
      setRecordButtonColor('black');
      SetisRecording(false);
      console.log("Recording saved at: ", result)
      console.warn("Voice Recorded! Click Analyze to get your results.")
      try {
        const response = await FileSystem.uploadAsync(
          FLASK_BACKEND, 
          result
        );
        // console.log(response.body["result"]);
        // const body = JSON.stringify(response.body);
        // console.log("Printing the response... ")
        // console.log(body)

        const test = JSON.parse(response.body)
        console.log(test["result"])
        setText(test["result"]);
        setImageUri(test["url"])
        // setTempUrl(test["url"])
        //console.log(text)
      } catch (err) {
        console.error(err);
      }
      recordedText = "Voice Recorded! Click Next to Continue."
    } catch (error) {
      console.log(error);
    }
  };

  const playSound = async () => {
    try {
      const result = await Player.current.loadAsync(
        { uri: RecordedURI },
        {},
        true
      );

      const response = await Player.current.getStatusAsync();
      if (response.isLoaded) {
        if (response.isPlaying === false) {
          Player.current.playAsync();
          SetisPLaying(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const stopSound = async () => {
    try {
      const checkLoading = await Player.current.getStatusAsync();
      if (checkLoading.isLoaded === true) {
        await Player.current.stopAsync();
        SetisPLaying(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //------------------------------------------

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/images/background.png')}
        style={styles.image}
        />
        <Text style= {{margin: 0, fontSize: 24, fontWeight: 'bold', textAlign: 'center'}}> Select exercise: </Text>
        <DropDownPicker 
              containerStyle={{height: 40, width: 200, margin: 24}}
              defaultIndex={0}
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              onChangeItem={item => console.log(item.label, item.value)}
            />
{/* 
        <Button
          style={styles.button}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
          onPress={isRecording ? () => stopRecording() : () => startRecording()}
        /> */}

        <CustomButton
          text = {isRecording ? 'Stop Recording' : 'Start Recording'}
          color = {recordButtonColor}
          textColor = 'white'
          onPress={isRecording ? () => stopRecording() : () => startRecording()}
        />
        {/* <Button
          style = {{backgroundColor: '#fff', fontWeight: 'bold'}}
          title="Play Sound"
          onPress={isPLaying ? () => stopSound : () => playSound()}
        /> */}

        <CustomButton
          text="Play Sound"
          color = 'grey'
          textColor = 'white'
          onPress={isPLaying ? () => stopSound : () => playSound()}
        />

        <CustomButton 
          text ='Analyze' 
          color = 'green' 
          textColor = 'white'
          onPress = {() => displayResult()}
          />
        <Image source={{uri: imageUri}} style = {{width: 160, height: 160, marginTop: 50}} />
        <Text
        style = {{
          marginTop: 20,
          fontSize: 16,
        }}> 
        {analysisText} 
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    padding: 8,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'yellow',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  image: {
    width: '102%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
});
