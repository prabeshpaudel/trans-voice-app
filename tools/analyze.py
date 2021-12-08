import sys
import os
import numpy as np
# import librosa
# import librosa.display
import matplotlib.pyplot as plot
import crepe
from scipy.io import wavfile

path = os.getcwd()
filename = sys.argv[1]

##print(os.path.join(path,filename))

fileLocation = os.path.join(path,filename)

sr, audio = wavfile.read(fileLocation)
time, frequency, confidence, activation = crepe.predict(audio, sr, step_size=25)

def selectZones(dict):
    vals = list(dict.values())
    piece = int(len(dict) / 8)
    return vals[piece*2:piece*3], vals[piece*5:piece*6]
    
def calcMean(list):
    if len(list) == 0:
        return 0
    return sum(list) / len(list)

def percentChange(a, b):
    if b == 0:
        return 0
    return 100 * (b - a) / b

def whisperTest(audio):
    before, after = selectZones(audio)
    a, b = calcMean(before), calcMean(after)
    if b < 1000:
        return 'failure: sound frequency under threshold: ' + str(a) + ' ' + str(b)
    if percentChange(a, b) <= 10:
        return 'failure: insignificant change'
    return 'success: mean freq ' + str(b) + ' Hz with ' + str(percentChange(a, b)) + '% change' 

def compareFreq(audio, test='whisper'):
    if test == "whisper":
        return whisperTest(audio)
    else:
        return "failure: no test selected"
    

##timeLis = np.ndarray.tolist(time)
##freqLis = np.ndarray.tolist(frequency)

##print(freqLis)
##print(type(freqLis))
##
##for i in range(len(timeLis)):
##    while abs(freqLis[i]-freqLis[i+1]) > 450:
##        timeLis.remove(i+1)
##        freqLis.remove(i+1)

##print(time)

##tmp = frequency
##tmp0 = time
##
##for i in range(len(frequency)):
##    if frequency[i] > 400:
##        tmp[i] = frequency[i]
##        tmp0[i] = time[i]
##frequency = tmp
##time = tmp0
##
##lock=frequency[0]
##frequencyAndTime = {k:(lock:=v) for k,v in zip(time,frequency) if abs(v-lock)<400}

frequencyAndTime = {time[i]:frequency[i] for i in range(len(time)) if frequency[i] > 400}

##print(frequencyAndTime)

##before,after = selectZones(frequencyAndTime)
##
##a, b = calcMean(before), calcMean(after)
##print(a, b)
##
##print(percentChange(a, b))

print(compareFreq(frequencyAndTime))
