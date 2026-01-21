// Referencias a elementos del DOM
const newsContainer = document.getElementById('news-container');
const newsLoading = document.getElementById('news-loading');
const goHome = document.getElementById('go-home');
const backButton = document.getElementById('back-button');
const backToList = document.getElementById('back-to-list');
const newsSection = document.getElementById('news-section');
const newsDetailSection = document.getElementById('news-detail-section');
const newsDetailLoading = document.getElementById('news-detail-loading');
const newsDetailContainer = document.getElementById('news-detail-container');
const newsDetailTitle = document.getElementById('news-detail-title');
const newsDetailCategory = document.getElementById('news-detail-category');
const newsDetailAuthor = document.getElementById('news-detail-author');
const newsDetailDate = document.getElementById('news-detail-date');
const newsDetailImage = document.getElementById('news-detail-image');
const newsDetailSummary = document.getElementById('news-detail-summary');
const newsDetailContent = document.getElementById('news-detail-content');
const shareNewsBtn = document.getElementById('share-news');

// Variable para almacenar el ID de la noticia actual
let currentNewsId = null;

// Cargar noticias al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    
    // Verificar si hay una noticia en la URL (para compartir)
    const urlParams = new URLSearchParams(window.location.search);
    const newsParam = urlParams.get('news');
    if (newsParam) {
        showNewsDetail(newsParam);
    }
});

// Cargar noticias desde Firestore
function loadNews() {
    newsContainer.innerHTML = '';
    newsLoading.classList.remove('hidden');
    
    db.collection('news')
        .orderBy('timestamp', 'desc')
        .get()
        .then(querySnapshot => {
            newsLoading.classList.add('hidden');
            
            if (querySnapshot.empty) {
                newsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No hay noticias publicadas aún.</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const news = doc.data();
                news.id = doc.id; // Guardar el ID del documento
                const newsCard = createNewsCard(news);
                newsContainer.appendChild(newsCard);
            });
        })
        .catch(error => {
            newsLoading.classList.add('hidden');
            console.error('Error detallado al cargar noticias:', error);
            newsContainer.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:30px; color:#c0392b;">
                    <h3>Error al cargar las noticias</h3>
                    <p>${error.message}</p>
                    <p>Por favor, verifica tu conexión a internet y la configuración de Firebase.</p>
                </div>
            `;
        });
}

// Crear tarjeta de noticia
function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.dataset.id = news.id; // Guardar el ID en el dataset
    
    const formattedDate = formatShortDate(news.timestamp);
    
    // Imagen por defecto si no hay URL proporcionada
    const imageUrl = news.imageUrl || DEFAULT_IMAGE;
    
    card.innerHTML = `
        <div class="news-image" style="background-image: url('${imageUrl}')"></div>
        <div class="news-content">
            <span class="news-category">${news.category || 'General'}</span>
            <h3 class="news-title">${news.title}</h3>
            <div class="news-date">
                <i class="far fa-calendar-alt"></i>
                ${formattedDate}
            </div>
            <p class="news-summary">${news.summary}</p>
            <div class="read-more">Leer más <i class="fas fa-arrow-right"></i></div>
        </div>
    `;
    
    // Agregar event listener para abrir la vista detallada
    card.addEventListener('click', () => {
        showNewsDetail(news.id);
    });
    
    return card;
}

// Mostrar vista detallada de una noticia
function showNewsDetail(newsId) {
    currentNewsId = newsId;
    
    // Mostrar sección de detalle y ocultar lista
    newsSection.classList.add('hidden');
    newsDetailSection.classList.remove('hidden');
    backToList.classList.remove('hidden');
    
    // Mostrar loading
    newsDetailContainer.classList.add('hidden');
    newsDetailLoading.classList.remove('hidden');
    
    // Actualizar URL sin recargar la página
    const newUrl = window.location.origin + window.location.pathname + '?news=' + newsId;
    window.history.pushState({ newsId }, '', newUrl);
    
    // Obtener noticia desde Firestore
    db.collection('news').doc(newsId).get()
        .then(doc => {
            if (doc.exists) {
                const news = doc.data();
                displayNewsDetail(news);
            } else {
                // Si no encuentra la noticia, mostrar error y volver
                showMessage('Noticia no encontrada', 'error');
                setTimeout(() => showNewsList(), 2000);
            }
        })
        .catch(error => {
            console.error('Error al cargar noticia:', error);
            showMessage('Error al cargar la noticia', 'error');
            setTimeout(() => showNewsList(), 2000);
        });
}

function displayNewsDetail(news) {
    // Ocultar loading y mostrar contenido
    newsDetailLoading.classList.add('hidden');
    newsDetailContainer.classList.remove('hidden');

    const formattedDate = formatDate(news.timestamp);
    const imageUrl = news.imageUrl || DEFAULT_IMAGE;
    const tags = news.tags ? news.tags.split(',').map(tag => tag.trim()) : [];

    // Actualizar elementos con los datos de la noticia
    newsDetailTitle.textContent = news.title;
    newsDetailCategory.textContent = news.category || 'General';
    newsDetailAuthor.textContent = `Por: ${news.author || 'Administrador'}`;
    newsDetailDate.textContent = formattedDate;
    newsDetailImage.style.backgroundImage = `url('${imageUrl}')`;
    newsDetailSummary.textContent = news.summary;

    // Insertar contenido enriquecido
    let contentHTML = news.content || '';

    // Insertar video si existe
    if (news.videoUrl) {
        const videoEmbed = getVideoEmbedCode(news.videoUrl);
        // Vamos a insertar el video en un contenedor específico
        // En lugar de concatenarlo, lo vamos a poner en una sección aparte
        // Pero para no cambiar mucho la estructura, vamos a ponerlo antes del contenido
        contentHTML = videoEmbed + contentHTML;
    }

    newsDetailContent.innerHTML = contentHTML;

    // Agregar etiquetas si existen
    if (tags.length > 0) {
        const tagsHTML = tags.map(tag =>
            `<span style="display: inline-block; background: #eef2ff; color: #4a6fc1; padding: 5px 10px; border-radius: 15px; font-size: 0.9rem; margin-right: 8px; margin-bottom: 8px;">#${tag}</span>`
        ).join('');

        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'news-tags';
        tagsContainer.style.marginTop = '30px';
        tagsContainer.style.paddingTop = '20px';
        tagsContainer.style.borderTop = '1px solid #eee';
        tagsContainer.innerHTML = `<strong>Etiquetas:</strong><br>${tagsHTML}`;

        newsDetailContent.appendChild(tagsContainer);
    }

    document.title = `${news.title} - Portal de Noticias`;
}//

// Obtener código de inserción para videos
function getVideoEmbedCode(videoUrl) {
    if (!videoUrl) return '';

    // YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';

        if (videoUrl.includes('youtube.com/watch?v=')) {
            videoId = videoUrl.split('v=')[1];
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
        } else if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1];
        }

        if (videoId) {
            return `
                <div class="video-container">
                    <iframe 
                        width="100%" 
                        height="400" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        }
    }

    // Vimeo
    if (videoUrl.includes('vimeo.com')) {
        const videoId = videoUrl.split('vimeo.com/')[1];
        if (videoId) {
            return `
                <div class="video-container">
                    <iframe 
                        width="100%" 
                        height="400" 
                        src="https://player.vimeo.com/video/${videoId}" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        }
    }

    // Si no es un enlace reconocido, mostrar un enlace normal
    return `<p><a href="${videoUrl}" target="_blank">Ver video</a></p>`;
}

// Volver a la lista de noticias
function showNewsList() {
    newsSection.classList.remove('hidden');
    newsDetailSection.classList.add('hidden');
    backToList.classList.add('hidden');
    
    // Restaurar URL original
    window.history.pushState({}, '', window.location.origin + window.location.pathname);
    
    // Restaurar título original
    document.title = 'Portal de Noticias';
}

// Compartir noticia
function shareNews() {
    if (!currentNewsId) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?news=${currentNewsId}`;
    const shareTitle = newsDetailTitle.textContent;
    const shareText = newsDetailSummary.textContent;
    
    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
        })
        .catch(error => console.log('Error al compartir:', error));
    } else {
        // Fallback para navegadores que no soportan Web Share API
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                showMessage('Enlace copiado al portapapeles', 'success');
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles: ', err);
                showMessage('Error al copiar el enlace', 'error');
            });
    }
}

// Mostrar mensaje temporal
function showMessage(message, type) {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `status-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '80px';
    messageEl.style.right = '20px';
    messageEl.style.zIndex = '1000';
    messageEl.style.maxWidth = '300px';
    
    document.body.appendChild(messageEl);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Manejar navegación del historial
window.addEventListener('popstate', function(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const newsParam = urlParams.get('news');
    
    if (newsParam) {
        showNewsDetail(newsParam);
    } else {
        showNewsList();
    }
});

// Event Listeners
if (backButton) backButton.addEventListener('click', showNewsList);
if (backToList) backToList.addEventListener('click', showNewsList);
if (goHome) goHome.addEventListener('click', showNewsList);
if (shareNewsBtn) shareNewsBtn.addEventListener('click', shareNews);