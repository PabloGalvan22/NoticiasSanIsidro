// Configuración de Firebase - REEMPLAZA CON TUS PROPIOS DATOS
const firebaseConfig = {
  apiKey: "AIzaSyBFXItxbyVAcHhF0x1l9ejg1b-O_F_raEg",
  authDomain: "noticias-seguridad.firebaseapp.com",
  projectId: "noticias-seguridad",
  storageBucket: "noticias-seguridad.firebasestorage.app",
  messagingSenderId: "719000010767",
  appId: "1:719000010767:web:2e54e84e94ddb3400da37a"
};

// Inicializar Firebase solo una vez
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.error('Error al inicializar Firebase:', error);
}

// Exportar servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Función para manejar errores de consulta
function handleQueryError(error, fallbackFunction) {
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn('Índice requerido no encontrado, usando método alternativo...');
        // Aquí podrías implementar un fallback
        return null;
    } else {
        console.error('Error de Firebase:', error);
        throw error;
    }
}

// Función para formatear fechas
function formatDate(date) {
    if (!date) return 'Fecha no disponible';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para obtener fecha corta
function formatShortDate(date) {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// URL de imagen por defecto
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

// Configurar año actual
document.addEventListener('DOMContentLoaded', function() {
    const yearElements = document.querySelectorAll('#current-year');
    yearElements.forEach(el => {
        if (el) el.textContent = new Date().getFullYear();
    });
});