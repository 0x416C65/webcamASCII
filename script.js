function getParameterByName(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const asciiElement = document.getElementById('ascii');

const scale = getParameterByName('scale') || 4.5;
const theme = getParameterByName('theme') || 'black';
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

document.body.classList.add(`theme-${theme}`);

function frameToAscii(frame) {
  let ascii = '';
  for (let y = 0; y < frame.height; y += 2) {
    for (let x = 0; x < frame.width; x++) {
      const offset = (y * frame.width + x) * 4;
      const r = frame.data[offset];
      const g = frame.data[offset + 1];
      const b = frame.data[offset + 2];
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const char =
        brightness < 0.25
          ? '#'
          : brightness < 0.5
          ? 'S'
          : brightness < 0.75
          ? '+'
          : '.';
      ascii += char;
    }
    ascii += '\n';
  }
  return ascii;
}

function startConversion() {
  video.addEventListener('loadedmetadata', () => {
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const canvasHeight = Math.floor(windowHeight / scale);
    const canvasWidth = Math.floor(canvasHeight * videoAspectRatio);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    setInterval(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const asciiFrame = frameToAscii(frame);
      asciiElement.textContent = asciiFrame;
    }, 100);
  });
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    video.srcObject = stream;
    video.play();
    startConversion();
  } catch (err) {
    console.error('Error accessing camera:', err);
  }
}

startCamera();
