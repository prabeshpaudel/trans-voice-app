from test import classify
import os

test_set = os.listdir("test_set")
results = []

correct = [res[:3] for res in test_set]

for file in test_set:
    result = classify('test_set/' + file)
    if result[0] == 'male':
        results.append('mas')
    else:
        results.append('fem')

classification = []

for i in range(len(results)):
    if results[i] == correct[i]:
        classification.append(True)
    else:
        classification.append(False)
print("#######################")
print("## Accuracy: ", sum(classification)/len(classification) * 100, "% ##")
print("#######################")

#print(classify("test_set/fem001.mp3"))