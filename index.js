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
const categoryFilterSelect = document.getElementById('category-filter-select');
const filterStats = document.getElementById('filter-stats');
const searchInput = document.getElementById('search-input');

let currentNewsId = null;
let currentCategory = '';
let currentSearch = '';
let debounceTimer;
let isLoading = false;
let currentLoadId = 0;

// Cargar noticias al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const newsParam = urlParams.get('news');
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (newsParam) {
        showNewsDetail(newsParam);
    } else {
        // Solo cargar noticias si no estamos en vista detalle
        if (categoryParam) {
            categoryFilterSelect.value = categoryParam;
            currentCategory = categoryParam;
        }
        
        if (searchParam) {
            searchInput.value = searchParam;
            currentSearch = searchParam;
        }
        
        loadNews(currentCategory, currentSearch);
    }

    // Configurar búsqueda con debounce
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
                currentSearch = this.value.trim();
                loadNews(currentCategory, currentSearch);
                
                // Actualizar URL
                updateURL();
            }, 500);
        });
        
        // Permitir búsqueda con Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimer);
                currentSearch = this.value.trim();
                loadNews(currentCategory, currentSearch);
                updateURL();
            }
        });
    }

    // Configurar filtro de categoría
    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener('change', function() {
            clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
                currentCategory = this.value;
                loadNews(currentCategory, currentSearch);
                updateURL();
            }, 300);
        });
    }
});

// Función para actualizar URL
function updateURL() {
    const urlParams = new URLSearchParams();
    
    if (currentCategory) {
        urlParams.set('category', currentCategory);
    }
    
    if (currentSearch) {
        urlParams.set('search', currentSearch);
    }
    
    const newUrl = window.location.pathname + 
                  (urlParams.toString() ? '?' + urlParams.toString() : '');
    
    if (newUrl !== window.location.search) {
        window.history.pushState(
            { category: currentCategory, search: currentSearch }, 
            '', 
            newUrl
        );
    }
}

// Cargar noticias desde Firestore - VERSIÓN CORREGIDA SIN DUPLICADOS
function loadNews(category = '', search = '') {
    // Prevenir múltiples cargas simultáneas
    if (isLoading) {
        console.log('Ya se está cargando, ignorando llamada duplicada');
        return;
    }
    
    const loadId = ++currentLoadId;
    console.log(`Iniciando carga #${loadId} con categoría: "${category}", búsqueda: "${search}"`);
    
    isLoading = true;
    newsContainer.innerHTML = '';
    newsLoading.classList.remove('hidden');
    
    let query = db.collection('news').orderBy('timestamp', 'desc');
    
    query.get()
        .then(querySnapshot => {
            // Verificar si esta es la carga más reciente
            if (loadId !== currentLoadId) {
                console.log(`Carga #${loadId} obsoleta, ignorando`);
                isLoading = false;
                return;
            }
            
            newsLoading.classList.add('hidden');
            
            if (querySnapshot.empty) {
                newsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No hay noticias publicadas aún.</p>';
                updateFilterStats(0, 0, category, search);
                isLoading = false;
                return;
            }
            
            let totalNews = 0;
            let filteredNews = 0;
            const newsToDisplay = [];
            const seenIds = new Set();
            const searchLower = search ? search.toLowerCase() : '';
            
            querySnapshot.forEach(doc => {
                totalNews++;
                const news = doc.data();
                news.id = doc.id;
                
                // Verificar duplicados por ID
                if (seenIds.has(news.id)) {
                    console.warn('Noticia duplicada ignorada:', news.id);
                    return;
                }
                seenIds.add(news.id);
                
                // FILTRO POR CATEGORÍA
                if (category && category !== '') {
                    if (!news.category || news.category.trim() !== category.trim()) {
                        return;
                    }
                }
                
                // FILTRO POR BÚSQUEDA
                if (search && search !== '') {
                    const titleMatch = news.title ? news.title.toLowerCase().includes(searchLower) : false;
                    const summaryMatch = news.summary ? news.summary.toLowerCase().includes(searchLower) : false;
                    const contentMatch = news.content ? news.content.toLowerCase().includes(searchLower) : false;
                    const tagsMatch = news.tags ? news.tags.toLowerCase().includes(searchLower) : false;
                    
                    if (!titleMatch && !summaryMatch && !contentMatch && !tagsMatch) {
                        return;
                    }
                }
                
                filteredNews++;
                newsToDisplay.push(news);
            });
            
            // Ordenar por fecha
            newsToDisplay.sort((a, b) => {
                const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
                const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
                return dateB - dateA;
            });
            
            // Mostrar noticias
            newsToDisplay.forEach(news => {
                const newsCard = createNewsCard(news, search);
                if (newsCard) {
                    newsContainer.appendChild(newsCard);
                }
            });
            
            updateFilterStats(totalNews, filteredNews, category, search);
            
            // Mostrar mensaje si no hay resultados
            if (filteredNews === 0 && (category || search)) {
                let message = 'No se encontraron noticias';
                if (category) message += ` en la categoría "${category}"`;
                if (search) message += ` con el término "${search}"`;
                
                newsContainer.innerHTML = `
                    <div class="no-results-message">
                        <i class="fas fa-search"></i>
                        <h3>${message}</h3>
                        <p>Intenta con otros términos de búsqueda o cambia de categoría</p>
                        <button id="clear-filters" class="back-button">
                            <i class="fas fa-times"></i> Limpiar filtros
                        </button>
                    </div>
                `;
                
                const clearBtn = document.getElementById('clear-filters');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        categoryFilterSelect.value = '';
                        searchInput.value = '';
                        currentCategory = '';
                        currentSearch = '';
                        loadNews();
                        filterStats.innerHTML = '';
                        updateURL();
                    });
                }
            }
            
            console.log(`Carga #${loadId} completada: ${filteredNews} de ${totalNews} noticias mostradas`);
        })
        .catch(error => {
            // Solo procesar errores de la carga más reciente
            if (loadId === currentLoadId) {
                newsLoading.classList.add('hidden');
                console.error('Error detallado al cargar noticias:', error);
                newsContainer.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:30px; color:#c0392b;">
                        <h3>Error al cargar las noticias</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        })
        .finally(() => {
            if (loadId === currentLoadId) {
                isLoading = false;
            }
        });
}

// Crear tarjeta de noticia
function createNewsCard(news, search = '') {
    if (!news || !news.id) {
        console.error('Datos de noticia inválidos:', news);
        return null;
    }
    
    const card = document.createElement('div');
    card.className = 'news-card';
    card.dataset.id = news.id;
    card.dataset.category = news.category || 'General';
    
    const formattedDate = formatShortDate(news.timestamp);
    const imageUrl = news.imageUrl || DEFAULT_IMAGE;
    
    // Función para resaltar texto de búsqueda
    const highlightText = (text) => {
        if (!search || !text || search.trim() === '') return text;
        
        const searchLower = search.toLowerCase();
        const textLower = text.toLowerCase();
        const index = textLower.indexOf(searchLower);
        
        if (index === -1) return text;
        
        const before = text.substring(0, index);
        const highlighted = text.substring(index, index + search.length);
        const after = text.substring(index + search.length);
        
        return `${before}<span class="highlight">${highlighted}</span>${after}`;
    };
    
    const highlightedTitle = highlightText(news.title);
    const highlightedSummary = highlightText(news.summary);
    
    card.innerHTML = `
        <div class="news-image" style="background-image: url('${imageUrl}')">
            <div class="news-card-category">${news.category || 'General'}</div>
        </div>
        <div class="news-content">
            <span class="news-category">${news.category || 'General'}</span>
            <h3 class="news-title">${highlightedTitle}</h3>
            <div class="news-date">
                <i class="far fa-calendar-alt"></i>
                ${formattedDate}
            </div>
            <p class="news-summary">${highlightedSummary}</p>
            <div class="read-more">Leer más <i class="fas fa-arrow-right"></i></div>
        </div>
    `;
    
    // Event listener con verificación de existencia
    const existingListener = card.getAttribute('data-has-listener');
    if (!existingListener) {
        card.setAttribute('data-has-listener', 'true');
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            showNewsDetail(news.id);
        });
    }
    
    return card;
}

// Actualizar estadísticas del filtro
function updateFilterStats(total, filtered, category, search) {
    if (!filterStats) return;
    
    let statsHTML = '';
    
    if (search && search !== '') {
        statsHTML = `
            <span class="filter-info">
                <i class="fas fa-search"></i> 
                Búsqueda: <strong>"${search}"</strong> - 
                Mostrando ${filtered} de ${total} noticias
                ${category ? `en <strong>${category}</strong>` : ''}
                <button id="clear-search-btn" class="clear-filter-btn">
                    <i class="fas fa-times"></i> Limpiar búsqueda
                </button>
            </span>
        `;
    } else if (category && category !== '') {
        statsHTML = `
            <span class="filter-info">
                <i class="fas fa-filter"></i> 
                Mostrando ${filtered} de ${total} noticias en <strong>${category}</strong>
                <button id="clear-filter-btn" class="clear-filter-btn">
                    <i class="fas fa-times"></i> Limpiar filtro
                </button>
            </span>
        `;
    } else {
        statsHTML = `
            <span class="filter-info">
                <i class="fas fa-newspaper"></i> 
                Mostrando todas las noticias (${total})
            </span>
        `;
    }
    
    filterStats.innerHTML = statsHTML;
    
    // Configurar botón para limpiar búsqueda
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchInput.value = '';
            currentSearch = '';
            loadNews(currentCategory, '');
            updateURL();
        });
    }
    
    // Configurar botón para limpiar filtro de categoría
    const clearFilterBtn = document.getElementById('clear-filter-btn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            categoryFilterSelect.value = '';
            currentCategory = '';
            loadNews('', currentSearch);
            updateURL();
        });
    }
}

// Mostrar vista detallada de una noticia
function showNewsDetail(newsId) {
    currentNewsId = newsId;
    
    newsSection.classList.add('hidden');
    newsDetailSection.classList.remove('hidden');
    backToList.classList.remove('hidden');
    
    newsDetailContainer.classList.add('hidden');
    newsDetailLoading.classList.remove('hidden');
    
    const newUrl = window.location.origin + window.location.pathname + '?news=' + newsId;
    window.history.pushState({ newsId, category: currentCategory, search: currentSearch }, '', newUrl);
    
    db.collection('news').doc(newsId).get()
        .then(doc => {
            if (doc.exists) {
                const news = doc.data();
                displayNewsDetail(news);
            } else {
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
    newsDetailLoading.classList.add('hidden');
    newsDetailContainer.classList.remove('hidden');

    const formattedDate = formatDate(news.timestamp);
    const imageUrl = news.imageUrl || DEFAULT_IMAGE;
    const tags = news.tags ? news.tags.split(',').map(tag => tag.trim()) : [];

    newsDetailTitle.textContent = news.title;
    newsDetailCategory.textContent = news.category || 'General';
    newsDetailAuthor.textContent = `Por: ${news.author || 'Administrador'}`;
    newsDetailDate.textContent = formattedDate;
    newsDetailImage.style.backgroundImage = `url('${imageUrl}')`;
    newsDetailSummary.textContent = news.summary;

    let contentHTML = news.content || '';

    if (news.videoUrl) {
        const videoEmbed = getVideoEmbedCode(news.videoUrl);
        contentHTML = videoEmbed + contentHTML;
    }

    newsDetailContent.innerHTML = contentHTML;

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
}

// Obtener código de inserción para videos
function getVideoEmbedCode(videoUrl) {
    if (!videoUrl) return '';

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

    return `<p><a href="${videoUrl}" target="_blank">Ver video</a></p>`;
}

// Volver a la lista de noticias
function showNewsList() {
    newsSection.classList.remove('hidden');
    newsDetailSection.classList.add('hidden');
    backToList.classList.add('hidden');
    
    loadNews(currentCategory, currentSearch);
    updateURL();
    
    document.title = 'Portal de Noticias' + 
                    (currentCategory ? ` - ${currentCategory}` : '') +
                    (currentSearch ? ` - Búsqueda: ${currentSearch}` : '');
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
    const messageEl = document.createElement('div');
    messageEl.className = `status-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '80px';
    messageEl.style.right = '20px';
    messageEl.style.zIndex = '1000';
    messageEl.style.maxWidth = '300px';
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Manejar navegación del historial
window.addEventListener('popstate', function(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const newsParam = urlParams.get('news');
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (newsParam) {
        showNewsDetail(newsParam);
    } else {
        if (categoryParam !== null) {
            currentCategory = categoryParam;
            categoryFilterSelect.value = categoryParam;
        } else {
            currentCategory = '';
            categoryFilterSelect.value = '';
        }
        
        if (searchParam !== null) {
            currentSearch = searchParam;
            searchInput.value = searchParam;
        } else {
            currentSearch = '';
            searchInput.value = '';
        }
        
        loadNews(currentCategory, currentSearch);
        showNewsList();
    }
});

// Event Listeners con prevención de múltiples listeners
function setupEventListeners() {
    if (backButton && !backButton.dataset.listenerAdded) {
        backButton.dataset.listenerAdded = 'true';
        backButton.addEventListener('click', showNewsList);
    }
    
    if (backToList && !backToList.dataset.listenerAdded) {
        backToList.dataset.listenerAdded = 'true';
        backToList.addEventListener('click', showNewsList);
    }
    
    if (goHome && !goHome.dataset.listenerAdded) {
        goHome.dataset.listenerAdded = 'true';
        goHome.addEventListener('click', showNewsList);
    }
    
    if (shareNewsBtn && !shareNewsBtn.dataset.listenerAdded) {
        shareNewsBtn.dataset.listenerAdded = 'true';
        shareNewsBtn.addEventListener('click', shareNews);
    }
}

// Inicializar listeners
setupEventListeners();