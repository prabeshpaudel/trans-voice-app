from flask import Flask
from flask import request
from flask import Response
from flask_cors import CORS
from pprint import pprint
import json
import datetime
import speech_recognition as sr
from classifier.test import classify
import os

app = Flask(__name__)
CORS(app)

def speech_to_text(audio_file):
    r = sr.Recognizer()
    # open the file
    with sr.AudioFile(audio_file) as source:
        # listen for the data (load audio to memory)
        audio_data = r.record(source)
        # recognize (convert from speech to text)
        text = r.recognize_google(audio_data)
        print(str(datetime.datetime.now()))
        return str(text)

# Members for API Route

myURL = 'https://miro.medium.com/max/2000/1*V2mgZ7y0ngd3q4DZ01xkEQ.png'

# myString = "This is a test return"


@app.route("/getResult", methods = ['GET','POST'])
def get_result():
    data = request.get_data()
    data_length = request.content_length

    now = str(datetime.datetime.now())
    # filename = "recordings/" + now + ".wav"
    filename = "recordings/myfile.wav"
    if filename:
        os.remove(filename)
    with open(filename, mode='bx') as f:
        f.write(data)

    print(classify("recordings/myfile.wav"))

    # when lines are uncommented the scripts doesn't return anything. 

    # conv_text = speech_to_text(filename)
    # myString = conv_text + " was saved!"

    myString = filename + " was saved!"

    print(myString)

    # print("Processing data: ", str(data)[:20])
    # print(type(data))

    return {"result": myString, "url": myURL}
    ## return "This is a test return from the Flask API"

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port = "8000", debug=True)
