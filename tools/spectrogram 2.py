#!/usr/bin/python3

import sys
import os
import numpy as np
# import librosa
# import librosa.display
import matplotlib.pyplot as plot

def displaySpectrogram(file):
    # show spectrogram, adapted from librosa documentation
    sdata,sr = librosa.load(file)
    stft = librosa.stft(sdata)
    S_db = librosa.amplitude_to_db(np.abs(stft), ref=np.max)
    fig, ax = plot.subplots()
    img = librosa.display.specshow(S_db, x_axis='time', y_axis='linear', ax=ax)
    ax.set(title=file)
    fig.colorbar(img, ax=ax, format="%+2.f dB")
    plot.show()

cwd = os.getcwd()

#print(cwd)

#print(str(sys.argv[1:]))

for i in sys.argv[1:]:
#    print(cwd+'/'+i)
    displaySpectrogram(cwd+'/'+i)
