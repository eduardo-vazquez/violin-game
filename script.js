// Importa el PitchDetector desde el CDN de pitchy (versión ESM, ECMAScript Module)
import { PitchDetector } from "https://esm.sh/pitchy@4";

function drawStaff() {
    const svg = document.querySelector('#staff-lines');
    const staffDiv = document.querySelector('.staff-container');

    // Obtener el tamaño actual del contenedor
    const width = staffDiv.offsetWidth;   // Ancho en píxeles
    const height = staffDiv.offsetHeight; // Alto en píxeles
    
    // Configurar el SVG con esos tamaños
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    
    // Calcular el espaciado de forma proporcional
    const lineSpacing = height / 4; // Divide la altura en 6 partes (5 líneas = 6 espacios)
    const startY = 0;  // Margen superior
    
    // Loop para 5 líneas
    for (let i = 0; i < 5; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "0");
        line.setAttribute("y1", startY + i * lineSpacing);
        line.setAttribute("x2", width);
        line.setAttribute("y2", startY + i * lineSpacing);
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    }
}

drawStaff();





const pitchElement = document.querySelector('#pitch');
// Variable global para almacenar el pitch actual
let currentPitch = 0;
// Solicita acceso al micrófono del usuario
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        // Crea un contexto de audio para procesar el sonido
        const audioContext = new (window.AudioContext || window.webkitAudioContext);
        // Crea una fuente de audio a partir del stream del micrófono
        const source = audioContext.createMediaStreamSource(stream);
        // Crea un nodo de análisis para obtener datos de audio en tiempo real
        const analyser = audioContext.createAnalyser();
        // Define el tamaño de la FFT (potencia de dos, recomendado 2048)
        const fftSize = 2048;
        analyser.fftSize = fftSize;
        // Conecta la fuente al analizador
        source.connect(analyser);

        // Obtiene la longitud del buffer de frecuencias (no se usa, pero es informativo)
        const bufferLength = analyser.frequencyBinCount;
        // Crea un buffer para almacenar los datos de audio en el dominio del tiempo
        const buffer = new Float32Array(analyser.fftSize);

        // Crea una instancia del detector de pitch para el tamaño de buffer especificado
        const detector = PitchDetector.forFloat32Array(fftSize);

        // Array para almacenar los últimos valores de pitch válidos
        const pitchHistory = [];
        const maxHistory = 10; // Tamaño del promedio móvil (ajusta según lo estable que quieras el valor)

        // Función que detecta la frecuencia fundamental en tiempo real
        function detectPitch() {
            // Llena el buffer con los datos de audio actuales
            analyser.getFloatTimeDomainData(buffer);
            // Detecta el pitch y la claridad usando el detector
            const [pitch, clarity] = detector.findPitch(buffer, audioContext.sampleRate);
            if (clarity > 0.95 && pitch) {
                // Agrega el valor de pitch al historial
                pitchHistory.push(pitch);
                // Mantiene el historial con el tamaño máximo
                if (pitchHistory.length > maxHistory) pitchHistory.shift();
                // Calcula el promedio móvil
                currentPitch = pitchHistory.reduce((a, b) => a + b, 0) / pitchHistory.length;
            } else {
                // Si no se detecta frecuencia clara, resetea el pitch
                currentPitch = 0;
                // Opcional: también puedes limpiar el historial si quieres que el promedio se reinicie
                pitchHistory.length = 0;
            }
            // Llama recursivamente para seguir detectando en tiempo real
            requestAnimationFrame(detectPitch);
        }
        // Inicia la detección de pitch
        detectPitch();
    })
    .catch(err => {
        console.error('Error accessing microphone:', err);
    }
);

// Actualizar la posición de la bola usando el pitch detectado
function updatePitchPosition() {
    pitchElement.style.left = `${Math.round(currentPitch)}px`;
    requestAnimationFrame(updatePitchsPosition);
}
updateBallPosition();