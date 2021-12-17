import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button, Text, Pressable, ImageBackground, Image, ScrollView } from 'react-native';
import { Audio, Video, AVPlaybackStatus } from 'expo-av';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from './button';
import * as FileSystem from "expo-file-system";
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import { WebView } from 'react-native-webview';

let recording = new Audio.Recording();
//const image = { uri: 'assets/images/background.png' };
let recordedText = " ";
// let imageUri = {uri:  'https://images.unsplash.com/photo-1615789591457-74a63395c990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZG9tZXN0aWMlMjBjYXR8ZW58MHx8MHx8&w=1000&q=80'};

const FLASK_BACKEND = "http://10.42.224.223:8000/getResult";

function HomeScreen({ navigation }) {

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
    //'https://media.npr.org/assets/img/2021/08/11/gettyimages-1279899488_wide-f3860ceb0ef19643c335cb34df3fa1de166e2761-s1100-c50.jpg'
    null
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
        setAnalysisText(" ")
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
        {/* <Text style= {{margin: 0, fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: 'green'}}> Welcome! </Text> */}

      <CustomButton 
          text ='Go to Exercise' 
          color = 'blue' 
          textColor = 'white'
          onPress={() => navigation.navigate('Exercise')}
          />
        {/* <DropDownPicker 
              containerStyle={{height: 40, width: 200, margin: 24}}
              defaultIndex={0}
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              onChangeItem={item => console.log(item.label, item.value)}
            /> */}
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
          color: 'white', 
          textAlign: 'center',
          marginLeft: 10,
          marginRight: 10,
        }}> 
        {analysisText} 
        </Text>
    </View>
  );
}


function Exercise({ navigation }) {
  const video = useRef(null);
  const [status, setStatus] = useState({});

  return (
    <View style={styles.container}>
      <ScrollView>
          <Text style = {{
              marginTop: 20,
              fontSize: 30,
              textAlign: 'center',
            }}>
              Whisper Siren
          </Text>
          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
            The point of this exercise is to become familiar with controlling the length of the vocal tract, which is essential to trans vocal modification. By raising the larynx, the vocal tract is shortened which results in a more feminine vocal quality without affecting the pitch of the voice. The larynx includes the “Adam’s apple” on the neck, so one indicator of a raised larynx is a raised Adam’s apple.
          </Text>

          <Image source={{uri: 'https://i.pinimg.com/736x/f8/14/f7/f814f7d706bb3f534f168dc66878ad4e.jpg'}} style = {{width: 360, height: 360, marginTop: 30}} />

          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              To perform the exercise, imagine that you are a large dog, which pants in a gruff, low register. Pant as if you are a big dog.
          </Text>

          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              Then, imagine how a small dog would pant. Its pants are lighter, in a higher register, and perhaps more shrill.
          </Text>

          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              Practice panting as a big dog, then as a small. Then, perform a series of pants, slowly adjusting the sound from the deep “big dog” register to the lighter “small dog” register.
          </Text>

          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              Once you can transition while panting, remove the pulses of panting and instead allow a steady stream of air, with the same quality of the dog panting, to come out. Slide from the “big dog” position to the “small dog” position until the sound is light and tinny–the only difference between this part of the exercise is that instead of panting, the breath should be steady and not pulsed.
          </Text>

          <Text style = {{
              marginTop: 20,
              marginBottom: 20,
              fontSize: 16,
            }}>
              This is the basic form of the whisper siren exercise. Practice smoothly transitioning from the “big dog” and “small dog” register. From there, practice other exercises, or try to hold the “small dog” position while speaking–without other vocal modifications, the voice may not sound perfect, but the exercise will raise the larynx and set the vocal tract length in a more desirable position.
          </Text>

          <Video
            ref={video}
            style={{
              alignSelf: 'center',
              width: 400,
              height: 300,
            }}
            source={require('./assets/videos/video1.mp4')}
            useNativeControls
            resizeMode="contain"
            isLooping
            onPlaybackStatusUpdate={status => setStatus(() => status)}
          />
          <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Button
              title={status.isPlaying ? 'Pause' : 'Play'}
              onPress={() =>
                status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
              }
            />
          </View>

          <WebView
            style={{flex:1}}
            javaScriptEnabled={true}
            source={{uri: 'https://www.youtube.com/embed/ZZ5LpwO-An4?rel=0&autoplay=0&showinfo=0&controls=0'}}
         />

      </ScrollView>
      {/* <ScrollView> <Text> Sample </Text> </ScrollView> */}
        {/* <Text>This is where the exercise description would go!</Text> */}
      </View>
  );
}

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Exercise" component={Exercise} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
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
    // flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
    position: 'absolute',
  },
});
