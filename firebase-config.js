// CONFIGURACIÓN DE FIREBASE - REEMPLAZA CON TUS DATOS DEL PASO 5
const firebaseConfig = {
  apiKey: "AIzaSyBFXItxbyVAcHhF0x1l9ejg1b-O_F_raEg",
  authDomain: "noticias-seguridad.firebaseapp.com",
  projectId: "noticias-seguridad",
  storageBucket: "noticias-seguridad.firebasestorage.app",
  messagingSenderId: "719000010767",
  appId: "1:719000010767:web:2e54e84e94ddb3400da37a"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado correctamente');
} catch (error) {
    console.error('Error al inicializar Firebase:', error);
}

// Exportar servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); // Para posibles futuras mejoras

// Funciones para formatear fechas
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

function formatShortDate(date) {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// URL de imagen por defecto (Se usará si no hay URL de imagen)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

// Configurar año actual
document.addEventListener('DOMContentLoaded', function() {
    const yearElements = document.querySelectorAll('#current-year');
    yearElements.forEach(el => {
        if (el) el.textContent = new Date().getFullYear();
    });
});