// controllers/faceController.js
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.resolve(__dirname, '../data');
const FACES_FILE = path.join(DATA_DIR, 'faces.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

fs.ensureDirSync(DATA_DIR);
if (!fs.existsSync(FACES_FILE)) fs.writeJsonSync(FACES_FILE, []);
if (!fs.existsSync(LOGS_FILE)) fs.writeJsonSync(LOGS_FILE, []);

function loadFaces() {
  return fs.readJsonSync(FACES_FILE);
}
function saveFaces(faces) {
  fs.writeJsonSync(FACES_FILE, faces, { spaces: 2 });
}
function appendLog(log) {
  const logs = fs.readJsonSync(LOGS_FILE);
  logs.push(log);
  fs.writeJsonSync(LOGS_FILE, logs, { spaces: 2 });
}

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// ====================== CONTROLLER METHODS ======================

// Register a new face
exports.registerFace = async (req, res) => {
  try {
    const { name, descriptor, imageBase64 } = req.body;
    if (!name || !descriptor || !imageBase64)
      return res.status(400).json({ error: 'name, descriptor, and imageBase64 are required.' });

    const id = uuidv4();
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const imageFile = path.join(DATA_DIR, `${id}.png`);
    await fs.writeFile(imageFile, imageBuffer);

    const faces = loadFaces();
    faces.push({
      id,
      name,
      descriptor,
      imageFile: path.basename(imageFile),
      createdAt: new Date().toISOString()
    });
    saveFaces(faces);

    return res.json({ success: true, id, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while registering face.' });
  }
};

// Scan and compare with stored faces
exports.scanFace = (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor) return res.status(400).json({ error: 'descriptor is required.' });

    const faces = loadFaces();
    let best = null;
    let bestDistance = Infinity;
    for (const f of faces) {
      const dist = euclideanDistance(f.descriptor, descriptor);
      if (dist < bestDistance) {
        bestDistance = dist;
        best = f;
      }
    }

    const THRESHOLD = 0.6;
    const timestamp = new Date().toISOString();

    if (best && bestDistance <= THRESHOLD) {
      const log = {
        id: uuidv4(),
        faceId: best.id,
        name: best.name,
        matchedAt: timestamp,
        distance: bestDistance
      };
      appendLog(log);
      return res.json({ matched: true, face: { id: best.id, name: best.name }, log });
    } else {
      const log = {
        id: uuidv4(),
        faceId: null,
        name: null,
        matchedAt: timestamp,
        distance: bestDistance
      };
      appendLog(log);
      return res.json({ matched: false, distance: bestDistance });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during face scan.' });
  }
};

// List all registered faces
exports.getFaces = (req, res) => {
  try {
    const faces = loadFaces();
    res.json(faces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Cannot load faces.' });
  }
};

// List all logs
exports.getLogs = (req, res) => {
  try {
    const logs = fs.readJsonSync(LOGS_FILE);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Cannot load logs.' });
  }
};
