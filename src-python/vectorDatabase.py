import faiss
import numpy as np

class vectorDatabase():
    def __init__(self, dim: int):
        self.names : np.ndarray = np.array([])
        self.dim : int = dim
        self.index = faiss.IndexFlatL2(dim)
        self.customDistanceThreshold = {'can': 6, 'ask': 3, 'also': 2.2, 'again': 4, 'deaf': 3, 'hi': 3, 'j': 2, 'my': 2, 'name': 4}

    def add(self, data: np.ndarray, names) -> None: 
        data=np.array(data)
        if data.shape[1] != self.dim:
            print(f"Incorrect dimension recieved {data.shape[1]} when expecting {self.dim}")
            return 
        if len(names) != len(data):
            print("Length of names does not match the length of dataset")
            return 
        self.names=np.append(self.names, names)
        self.index.add(data)

    def search(self, vector: np.ndarray, k: int=1, distanceThreshold: int = 0.5):
        if len(self.names) == 0:
            return None
        vector = np.array(vector)
        distnn, ann = self.index.search(vector, k=k)
        result = []
        for candidates, distances in zip(ann, distnn):
            for (distance, candidate) in zip(distances, candidates):
                if self.names[candidate] in self.customDistanceThreshold:
                    if distance < self.customDistanceThreshold[self.names[candidate]]:
                        result.append((distance, self.names[candidate]))
                elif distance < distanceThreshold:
                    result.append([distance, self.names[candidate]])
        result.sort(key=lambda x: x[0])
        return [[float(distance), name] for distance, name in result]

PARAM = 2*21*3
TIMEFRAME = 30
database = vectorDatabase(63)

def search(landmarks):
    vector = []
    for landmark in landmarks:
        lmk = []
        for point in landmark:
            lmk.append([point['x'], point['y'], point['z']])
        vector.append(lmk)
    vector = np.array(vector).flatten()
    return database.search([vector])

def add_vector(landmarks, names):
    try:
        vector = []
        for landmark in landmarks:
            lmk = []
            for point in landmark:
                lmk.append([point['x'], point['y'], point['z']])
            vector.append(lmk)
        vector = np.array(vector).flatten()
        database.add([vector], names)
        return True
    except:
        return False





