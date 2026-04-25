import { PitchDetector } from "https://esm.sh/pitchy@4";

const frecuenciaLa4 = 440; 
const frecuenciasViolin = generarFrecuenciasViolin();


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

// Variable global para almacenar el pitch actual
let currentPitch = 0;
// Solicita acceso al micrófono del usuario
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext);
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        const fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const buffer = new Float32Array(analyser.fftSize);
        const detector = PitchDetector.forFloat32Array(fftSize);
        analyser.fftSize = fftSize;
        source.connect(analyser);

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
function updateNotePosition() {
    const noteElement = document.querySelector('#note');
    let pitchHight= currentPitch;

    if (pitchHight >= frecuenciasViolin.sol2 && pitchHight <= frecuenciasViolin.sol2s) {
        pitchHight = frecuenciasViolin.sol2; //
        showSharp(frecuenciasViolin.sol2s); // Mostrar sostenido para Sol al aire
    } else if (pitchHight >= frecuenciasViolin.la2 && pitchHight <= frecuenciasViolin.la2s) {
        pitchHight = frecuenciasViolin.la2; // La al aire
        showSharp(frecuenciasViolin.la2s); // Mostrar sostenido para La al aire
    } else if (pitchHight >= frecuenciasViolin.do3 && pitchHight <= frecuenciasViolin.do3s) {
        pitchHight = frecuenciasViolin.do3; // Do (debajo del pentagrama)
        showSharp(frecuenciasViolin.do3s); // Mostrar sostenido para Do
    } else if (pitchHight >= frecuenciasViolin.re3 && pitchHight <= frecuenciasViolin.re3s) {
        pitchHight = frecuenciasViolin.re3; // Re al aire
        showSharp(frecuenciasViolin.re3s); // Mostrar sostenido para Re al aire
    } else if (pitchHight >= frecuenciasViolin.fa4 && pitchHight <= frecuenciasViolin.fa4s) {
        pitchHight  = frecuenciasViolin.fa4; // Fa natural
        showSharp(frecuenciasViolin.fa4s); // Mostrar sostenido para Fa natural
    } else if (pitchHight >= frecuenciasViolin.fa3 && pitchHight <= frecuenciasViolin.fa3s) {
       pitchHight = frecuenciasViolin.fa3; // Fa (entre la 1ª y 2ª línea)
       showSharp(frecuenciasViolin.fa3s); // Mostrar sostenido para Fa (entre la 1ª y 2ª línea)
    } else if (pitchHight >= frecuenciasViolin.sol3 && pitchHight <= frecuenciasViolin.sol3s) {
        pitchHight = frecuenciasViolin.sol3; // Sol (2ª línea del pentagrama)
        showSharp(frecuenciasViolin.sol3s); // Mostrar sostenido para Sol (2ª línea del pentagrama)
    } else if (pitchHight >= frecuenciasViolin.la3 && pitchHight <= frecuenciasViolin.la3s) {
        pitchHight = frecuenciasViolin.la3; // La (3ª línea del pentagrama)
        showSharp(frecuenciasViolin.la3s); // Mostrar sostenido para La (3ª línea del pentagrama)
    } else if (pitchHight >= frecuenciasViolin.do4 && pitchHight <= frecuenciasViolin.do4s) {
        pitchHight = frecuenciasViolin.do4; // Si (4ª línea del pentagrama)
        showSharp(frecuenciasViolin.do4s); // Mostrar sostenido para Si (4ª línea del pentagrama)
    } else if (pitchHight >= frecuenciasViolin.re4 && pitchHight <= frecuenciasViolin.re4s) {
        pitchHight = frecuenciasViolin.re4; // Re (5ª línea del pentagrama)
        showSharp(frecuenciasViolin.re4s); // Mostrar sostenido para Re (5ª línea del pentagrama)
    } else if (pitchHight >= frecuenciasViolin.fa4 && pitchHight <= frecuenciasViolin.fa4s) {
        pitchHight = frecuenciasViolin.fa4; // Fa natural
        showSharp(frecuenciasViolin.fa4s); // Mostrar sostenido para Fa natural
    } else if (pitchHight >= frecuenciasViolin.sol4 && pitchHight <= frecuenciasViolin.sol4s) {
        pitchHight = frecuenciasViolin.sol4; // Sol (cuerda Sol al aire)
        showSharp(frecuenciasViolin.sol4s); // Mostrar sostenido para Sol (cuerda Sol al aire)
    } else if (pitchHight >= frecuenciasViolin.la4 && pitchHight <= frecuenciasViolin.la4s) {
        pitchHight = frecuenciasViolin.la4; // La (cuerda La al aire)
        showSharp(frecuenciasViolin.la4s); // Mostrar sostenido para La (cuerda La al aire)
    } else {
        pitchHight = currentPitch; // Mi (cuerda Mi al aire)
        showSharp(null); // Mostrar sostenido para Mi (cuerda Mi al aire)
    }


    noteElement.style.bottom = `calc(${mapPitchToPosition(pitchHight)}% - 1.5rem)`;
    requestAnimationFrame(updateNotePosition);
}
updateNotePosition();

function updateNoteColor() {
    const noteElement = document.querySelector('#note');
    const targetFreq = frecuenciasViolin.fa4; // Frecuencia objetivo (Fa natural)
    const tolerance = 10; // Tolerancia en Hz para considerar que el pitch es correcto

    if (Math.abs(currentPitch - targetFreq) <= tolerance) {
        noteElement.style.backgroundColor = 'green'; // Correcto
    } else if (currentPitch > 0) {
        noteElement.style.backgroundColor = 'red'; // Incorrecto pero hay pitch
    } else {
        noteElement.style.backgroundColor = '#fff'; // Sin pitch detectado
    }
    requestAnimationFrame(updateNoteColor);
}
updateNoteColor();

function showSharp(targetFreq) {
    if (!targetFreq) return; // Si no hay frecuencia objetivo, no mostrar sostenido
    const sharpElement = document.querySelector('#sharp');
    const tolerance = 10; // Tolerancia en Hz para mostrar el sostenido

    const distance = Math.abs(currentPitch - targetFreq); // Distancia al Fa natural
    if (distance <= tolerance) {
        const opacityValue = 1 - (distance / tolerance); // Opacidad proporcional a la cercanía
        sharpElement.style.opacity = opacityValue; // Mostrar el sostenido con opacidad proporcional
    } else {
        sharpElement.style.opacity = 0; // Ocultar el sostenido si está fuera de rango
    }
}

function mapPitchToPosition(pitch) {
    if (pitch === 0) return 50; // Posición por defecto si no se detecta pitch
    const position = ((pitch - frecuenciasViolin.mi3) / (frecuenciasViolin.fa4 - frecuenciasViolin.mi3)) * 100; // Mapear al rango de 0% a 100%

    return position; // Ajustar para centrar la bola
}

function generarFrecuenciasViolin(afinacionLa = 440) {
    const obtenerFreq = (dist) => afinacionLa * Math.pow(2, dist / 12);

    return {
        sol2:  obtenerFreq(-14), // Cuerda Sol al aire (196 Hz)
        sol2s: obtenerFreq(-13), 
        la2:   obtenerFreq(-12), 
        la2s:  obtenerFreq(-11), 
        si2:   obtenerFreq(-10), 
        do3:   obtenerFreq(-9),  // Do (debajo del pentagrama)
        do3s:  obtenerFreq(-8), 
        re3:   obtenerFreq(-7),  // Cuerda Re al aire
        re3s:  obtenerFreq(-6),
        mi3:   obtenerFreq(-5),  // Mi (1ª línea del pentagrama)
        fa3:   obtenerFreq(-4),  
        fa3s:  obtenerFreq(-3), 
        sol3:  obtenerFreq(-2),  
        sol3s: obtenerFreq(-1), 
        la3:   obtenerFreq(0),   // Cuerda La al aire (440 Hz)
        la3s:  obtenerFreq(1),
        si3:   obtenerFreq(2), 
        do4:   obtenerFreq(3), 
        do4s:  obtenerFreq(4),
        re4:   obtenerFreq(5), 
        re4s:  obtenerFreq(6), 
        mi4:   obtenerFreq(7),   // Cuerda Mi al aire
        fa4:   obtenerFreq(8),   // Fa natural (el que preguntaste al inicio)
        fa4s:  obtenerFreq(9), 
        sol4:  obtenerFreq(10), 
        sol4s: obtenerFreq(11), 
        la4:   obtenerFreq(12),  
        la4s:  obtenerFreq(13),
        si4:   obtenerFreq(14),
        do5:   obtenerFreq(15),
        do5s:  obtenerFreq(16),
        re5:   obtenerFreq(17),
        re5s:  obtenerFreq(18),
        mi5:   obtenerFreq(19),
        fa5:   obtenerFreq(20),
        fa5s:  obtenerFreq(21),
        sol5:  obtenerFreq(22),
        sol5s: obtenerFreq(23),
        la5:   obtenerFreq(24),
        la5s:  obtenerFreq(25),
        si5:   obtenerFreq(26),  
        do6:   obtenerFreq(27),
    };
}