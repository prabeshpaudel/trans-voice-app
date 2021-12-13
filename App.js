import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button, Text, Pressable, ImageBackground, Image, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from './button';
import * as FileSystem from "expo-file-system";
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';

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
        <Text style= {{margin: 0, fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: 'green'}}> Welcome! </Text>

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
        }}> 
        {analysisText} 
        </Text>
    </View>
  );
}


function Exercise({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView>
          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lacus sed viverra tellus in. Vitae sapien pellentesque habitant morbi tristique senectus et netus. Cursus mattis molestie a iaculis at erat pellentesque. In massa tempor nec feugiat nisl pretium fusce id. Neque egestas congue quisque egestas diam in arcu cursus. Id velit ut tortor pretium. Placerat in egestas erat imperdiet sed. Varius sit amet mattis vulputate enim. Lectus quam id leo in vitae turpis massa.
          
          </Text>
          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>

              Aliquet risus feugiat in ante metus dictum. Cras fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Non consectetur a erat nam at lectus urna duis. Amet aliquam id diam maecenas ultricies mi eget. Id nibh tortor id aliquet. Risus at ultrices mi tempus imperdiet. Consectetur a erat nam at lectus. Sit amet nulla facilisi morbi tempus iaculis. Pellentesque nec nam aliquam sem et tortor consequat. Gravida neque convallis a cras semper auctor neque vitae tempus. Quisque non tellus orci ac auctor. Etiam tempor orci eu lobortis elementum nibh tellus. Lectus mauris ultrices eros in cursus turpis massa tincidunt dui. Eget nullam non nisi est sit amet facilisis magna etiam. Integer malesuada nunc vel risus.
          </Text>

          <Image source={{uri: 'https://as1.ftcdn.net/v2/jpg/04/55/23/78/1000_F_455237897_36KT5eDfFoJanXeZgFapPaUMny3gXuTn.jpg'}} style = {{width: 360, height: 360, marginTop: 30}} />

          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              Pharetra sit amet aliquam id diam maecenas ultricies mi eget. Risus nec feugiat in fermentum posuere urna nec tincidunt praesent. Dolor sit amet consectetur adipiscing elit ut aliquam purus sit. Cras ornare arcu dui vivamus arcu felis bibendum. Sodales neque sodales ut etiam sit amet. At auctor urna nunc id cursus. In metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Ut pharetra sit amet aliquam id diam maecenas. Ut aliquam purus sit amet luctus venenatis lectus. Habitant morbi tristique senectus et. Tortor aliquam nulla facilisi cras fermentum. Adipiscing commodo elit at imperdiet dui. Pulvinar pellentesque habitant morbi tristique senectus et.
          </Text>

          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              Odio morbi quis commodo odio aenean sed adipiscing. Nisi est sit amet facilisis magna. Enim facilisis gravida neque convallis a cras semper auctor. Quis blandit turpis cursus in hac habitasse platea dictumst. Tincidunt ornare massa eget egestas purus viverra accumsan. Ut pharetra sit amet aliquam. Ultrices tincidunt arcu non sodales. Ac turpis egestas integer eget aliquet nibh praesent. Nisi scelerisque eu ultrices vitae auctor. Phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Senectus et netus et malesuada fames. Enim lobortis scelerisque fermentum dui faucibus in ornare.
          </Text>

          <Text style = {{
              marginTop: 20,
              fontSize: 16,
            }}>
              Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget gravida. Nisi quis eleifend quam adipiscing vitae. Massa vitae tortor condimentum lacinia quis vel. Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Neque laoreet suspendisse interdum consectetur. Dui vivamus arcu felis bibendum ut tristique. Eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis. Dolor sit amet consectetur adipiscing elit pellentesque habitant morbi. Hac habitasse platea dictumst quisque sagittis purus. Velit laoreet id donec ultrices. Non sodales neque sodales ut etiam sit. Varius morbi enim nunc faucibus. Maecenas ultricies mi eget mauris pharetra et ultrices. Urna duis convallis convallis tellus. Tortor vitae purus faucibus ornare. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis a. Id cursus metus aliquam eleifend mi in. Aliquet enim tortor at auctor.
          </Text>
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
    width: '102%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
});
