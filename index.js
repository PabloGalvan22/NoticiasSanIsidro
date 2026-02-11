// Referencias a elementos del DOM
const categoriesSection = document.getElementById('categories-section');
const categoryDetailSection = document.getElementById('category-detail-section');
const newsDetailSection = document.getElementById('news-detail-section');
const categoriesContainer = document.getElementById('categories-container');
const categoriesLoading = document.getElementById('categories-loading');
const categoryNewsContainer = document.getElementById('category-news-container');
const categoryNewsLoading = document.getElementById('category-news-loading');
const categoryTitle = document.getElementById('category-title');
const backToCategoriesBtn = document.getElementById('back-to-categories');
const backButton = document.getElementById('back-button');
const goHome = document.getElementById('go-home');
const searchInput = document.getElementById('search-input');
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
const filterStats = document.getElementById('filter-stats');

// NUEVAS REFERENCIAS para búsqueda en categoría
const categorySearchInput = document.getElementById('category-search-input');
const clearCategorySearchBtn = document.getElementById('clear-category-search-public');

let currentCategory = '';
let currentSearch = '';
let currentCategorySearch = ''; // NUEVA VARIABLE para búsqueda en categoría
let currentNewsId = null;
let debounceTimer;
let isLoading = false;
let currentLoadId = 0;

// Colores para cada categoría
const categoryColors = {
    'Política': '#ff00a2',
    'Tecnología': '#2400f2',
    'Deportes': '#c42513',
    'Cultura': '#8007af',
    'Salud': '#6bc4ff',
    'Internacional': '#ff9d00',
    'Economía': '#01ffcc',
    'Educación': '#27ae60',
    'Entretenimiento': '#f6ff00',
    'Ciencia': '#3c454e',
    'Ayudas': '#692e00',
    'Comunitaria': '#ff0000',
    'General': '#d5cdcd'
};

// Iconos para cada categoría
const categoryIcons = {
    'Política': 'fa-landmark',
    'Tecnología': 'fa-microchip',
    'Deportes': 'fa-futbol',
    'Cultura': 'fa-theater-masks',
    'Salud': 'fa-heartbeat',
    'Internacional': 'fa-globe-americas',
    'Economía': 'fa-chart-line',
    'Educación': 'fa-graduation-cap',
    'Entretenimiento': 'fa-film',
    'Ciencia': 'fa-flask',
    'Ayudas': 'fa-hands-helping',
    'Comunitaria': 'fa-home',
    'General': 'fa-newspaper'
};

// Cargar categorías al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const newsParam = urlParams.get('news');
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (newsParam) {
        showNewsDetail(newsParam);
    } else if (categoryParam) {
        showCategoryDetail(categoryParam);
    } else {
        if (searchParam) {
            searchInput.value = searchParam;
            currentSearch = searchParam;
        }
        loadCategories(currentSearch);
    }

    // Configurar búsqueda con debounce
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
                currentSearch = this.value.trim();
                loadCategories(currentSearch);
                updateURL();
            }, 500);
        });
        
        // Permitir búsqueda con Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimer);
                currentSearch = this.value.trim();
                loadCategories(currentSearch);
                updateURL();
            }
        });
    }
    
    // Configurar búsqueda en categoría
    setupCategorySearch();
});

// Función para configurar la búsqueda en categoría
function setupCategorySearch() {
    let categorySearchDebounceTimer;
    
    if (categorySearchInput) {
        categorySearchInput.addEventListener('input', function() {
            clearTimeout(categorySearchDebounceTimer);
            const searchTerm = this.value.trim();
            currentCategorySearch = searchTerm;
            
            // Mostrar/ocultar botón de limpiar
            if (clearCategorySearchBtn) {
                clearCategorySearchBtn.style.display = searchTerm ? 'inline-block' : 'none';
            }
            
            categorySearchDebounceTimer = setTimeout(() => {
                loadCategoryNews(currentCategory, searchTerm);
            }, 500);
        });
        
        // Permitir búsqueda con Enter
        categorySearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(categorySearchDebounceTimer);
                const searchTerm = this.value.trim();
                currentCategorySearch = searchTerm;
                loadCategoryNews(currentCategory, searchTerm);
            }
        });
    }
    
    // Botón para limpiar búsqueda en categoría
    if (clearCategorySearchBtn && !clearCategorySearchBtn.dataset.listenerAdded) {
        clearCategorySearchBtn.dataset.listenerAdded = 'true';
        clearCategorySearchBtn.addEventListener('click', () => {
            categorySearchInput.value = '';
            currentCategorySearch = '';
            clearCategorySearchBtn.style.display = 'none';
            loadCategoryNews(currentCategory);
        });
    }
}

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

// Cargar categorías con noticias - VERSIÓN SIN DUPLICADOS
function loadCategories(search = '') {
    // Prevenir múltiples cargas simultáneas
    if (isLoading) {
        console.log('Ya se está cargando, ignorando llamada duplicada');
        return;
    }
    
    const loadId = ++currentLoadId;
    console.log(`Iniciando carga categorías #${loadId} con búsqueda: "${search}"`);
    
    isLoading = true;
    categoriesContainer.innerHTML = '';
    categoriesLoading.classList.remove('hidden');
    filterStats.innerHTML = '';
    
    db.collection('news').get()
        .then(querySnapshot => {
            // Verificar si es la carga más reciente
            if (loadId !== currentLoadId) {
                console.log(`Carga categorías #${loadId} obsoleta, ignorando`);
                isLoading = false;
                return;
            }
            
            categoriesLoading.classList.add('hidden');
            
            if (querySnapshot.empty) {
                categoriesContainer.innerHTML = `
                    <div class="no-results-message">
                        <i class="fas fa-newspaper"></i>
                        <h3>No hay noticias publicadas aún</h3>
                        <p>Vuelve más tarde o publica nuevas noticias desde el modo administrador</p>
                    </div>
                `;
                isLoading = false;
                return;
            }
            
            // Agrupar noticias por categoría
            const newsByCategory = {};
            const totalNews = querySnapshot.size;
            let filteredNews = 0;
            const searchLower = search ? search.toLowerCase() : '';
            const seenIds = new Set(); // Para evitar duplicados por ID
            
            querySnapshot.forEach(doc => {
                const news = doc.data();
                news.id = doc.id;
                
                // Evitar duplicados por ID
                if (seenIds.has(news.id)) {
                    console.warn('Noticia duplicada ignorada:', news.id);
                    return;
                }
                seenIds.add(news.id);
                
                // Filtrar por búsqueda si existe
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
                const category = news.category || 'General';
                
                if (!newsByCategory[category]) {
                    newsByCategory[category] = [];
                }
                
                // Agregar noticia a la categoría
                newsByCategory[category].push(news);
            });
            
            // Ordenar noticias dentro de cada categoría por fecha (más reciente primero)
            Object.keys(newsByCategory).forEach(category => {
                newsByCategory[category].sort((a, b) => {
                    const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
                    const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
                    return dateB - dateA;
                });
                
                // Mantener solo las 3 noticias más recientes por categoría para la vista principal
                newsByCategory[category] = newsByCategory[category].slice(0, 3);
            });
            
            // Mostrar estadísticas si hay búsqueda
            if (search) {
                filterStats.innerHTML = `
                    <span class="filter-info">
                        <i class="fas fa-search"></i> 
                        Búsqueda: <strong>"${search}"</strong> - 
                        Encontradas ${filteredNews} noticias en ${Object.keys(newsByCategory).length} categorías
                        <button id="clear-search-btn" class="clear-filter-btn">
                            <i class="fas fa-times"></i> Limpiar búsqueda
                        </button>
                    </span>
                `;
                
                const clearBtn = document.getElementById('clear-search-btn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        searchInput.value = '';
                        currentSearch = '';
                        loadCategories('');
                        updateURL();
                    });
                }
            }
            
            // Si no hay noticias después del filtro
            if (filteredNews === 0 && search) {
                categoriesContainer.innerHTML = `
                    <div class="no-results-message">
                        <i class="fas fa-search"></i>
                        <h3>No se encontraron noticias</h3>
                        <p>No hay noticias con el término "${search}"</p>
                        <button id="clear-filters" class="back-button">
                            <i class="fas fa-times"></i> Limpiar búsqueda
                        </button>
                    </div>
                `;
                
                const clearBtn = document.getElementById('clear-filters');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        searchInput.value = '';
                        currentSearch = '';
                        loadCategories('');
                        updateURL();
                    });
                }
                isLoading = false;
                return;
            }
            
            // Crear tarjetas de categorías
            Object.keys(newsByCategory).forEach(categoryName => {
                const categoryNews = newsByCategory[categoryName];
                const categoryCard = createCategoryCard(categoryName, categoryNews);
                categoriesContainer.appendChild(categoryCard);
            });
            
            isLoading = false;
            console.log(`Carga categorías #${loadId} completada: ${filteredNews} noticias en ${Object.keys(newsByCategory).length} categorías`);
        })
        .catch(error => {
            if (loadId === currentLoadId) {
                categoriesLoading.classList.add('hidden');
                console.error('Error al cargar noticias:', error);
                categoriesContainer.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:30px; color:#c0392b;">
                        <h3>Error al cargar las noticias</h3>
                        <p>${error.message}</p>
                        <p style="margin-top: 10px; font-size: 0.9rem;">
                            <strong>Solución:</strong> Ve a 
                            <a href="https://console.firebase.google.com/v1/r/project/noticias-seguridad/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9ub3RpY2lhcy1zZWd1cmlkYWQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25ld3MvaW5kZXhlcy9fEAEaDAoIY2F0ZWdvcnkQARoNCgl0aW1lc3RhbXAQAhoMCghfX25hbWVfXxAC" 
                               target="_blank" style="color: #4a6fc1; text-decoration: underline;">
                                este enlace
                            </a> 
                            y haz clic en "Crear índice". Luego espera unos minutos y recarga.
                        </p>
                    </div>
                `;
            }
            isLoading = false;
        });
}

// Crear tarjeta de categoría
function createCategoryCard(categoryName, newsList) {
    const card = document.createElement('div');
    card.className = 'category-card';
    const categoryColor = categoryColors[categoryName] || '#4a6fc1';
    const categoryIcon = categoryIcons[categoryName] || 'fa-folder';
    
    card.innerHTML = `
        <div class="category-card-header" style="background-color: ${categoryColor}">
            <div class="category-icon">
                <i class="fas ${categoryIcon}"></i>
            </div>
            <h3 class="category-card-title">${categoryName}</h3>
            <span class="category-count">${newsList.length} noticia${newsList.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="category-card-body">
            <div class="category-news-list">
                ${newsList.map(news => `
                    <div class="category-news-item" data-id="${news.id}">
                        <div class="category-news-image" style="background-image: url('${news.imageUrl || DEFAULT_IMAGE}')"></div>
                        <div class="category-news-content">
                            <h4 class="category-news-title">${news.title}</h4>
                            <div class="category-news-date">
                                <i class="far fa-calendar-alt"></i>
                                ${formatShortDate(news.timestamp)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="category-card-footer">
            <button class="view-category-btn" data-category="${categoryName}">
                Ver todas las noticias de ${categoryName}
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Agregar event listeners (solo una vez)
    const viewBtn = card.querySelector('.view-category-btn');
    if (viewBtn && !viewBtn.dataset.listenerAdded) {
        viewBtn.dataset.listenerAdded = 'true';
        viewBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const category = this.getAttribute('data-category');
            showCategoryDetail(category);
        });
    }
    
    // Agregar listeners a cada noticia individual (solo una vez)
    const newsItems = card.querySelectorAll('.category-news-item');
    newsItems.forEach(item => {
        if (!item.dataset.listenerAdded) {
            item.dataset.listenerAdded = 'true';
            item.addEventListener('click', function() {
                const newsId = this.getAttribute('data-id');
                showNewsDetail(newsId);
            });
        }
    });
    
    return card;
}

// Mostrar detalles de una categoría - VERSIÓN CON BÚSQUEDA
function showCategoryDetail(category) {
    currentCategory = category;
    currentCategorySearch = '';
    
    categoriesSection.classList.add('hidden');
    categoryDetailSection.classList.remove('hidden');
    categoryTitle.textContent = category;
    
    // Resetear búsqueda en categoría
    if (categorySearchInput) {
        categorySearchInput.value = '';
    }
    if (clearCategorySearchBtn) {
        clearCategorySearchBtn.style.display = 'none';
    }
    
    const newUrl = window.location.origin + window.location.pathname + '?category=' + encodeURIComponent(category);
    window.history.pushState({ category, search: currentSearch }, '', newUrl);
    
    loadCategoryNews(category);
}

// Cargar noticias de una categoría con búsqueda
function loadCategoryNews(category, searchTerm = '') {
    // Prevenir múltiples cargas simultáneas
    if (isLoading) {
        console.log('Ya se está cargando, ignorando llamada duplicada');
        return;
    }
    
    const loadId = ++currentLoadId;
    console.log(`Iniciando carga categoría #${loadId} para: "${category}" con búsqueda: "${searchTerm}"`);
    
    isLoading = true;
    categoryNewsContainer.innerHTML = '';
    categoryNewsLoading.classList.remove('hidden');
    
    db.collection('news').get()
        .then(querySnapshot => {
            // Verificar si es la carga más reciente
            if (loadId !== currentLoadId) {
                console.log(`Carga categoría #${loadId} obsoleta, ignorando`);
                isLoading = false;
                return;
            }
            
            categoryNewsLoading.classList.add('hidden');
            
            if (querySnapshot.empty) {
                categoryNewsContainer.innerHTML = `
                    <div class="category-no-results">
                        <i class="fas fa-newspaper"></i>
                        <h4>No hay noticias en esta categoría</h4>
                        <p>No se encontraron noticias en la categoría "${category}"</p>
                    </div>
                `;
                isLoading = false;
                return;
            }
            
            const newsList = [];
            const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
            const seenIds = new Set(); // Para evitar duplicados
            
            querySnapshot.forEach(doc => {
                const news = doc.data();
                news.id = doc.id;
                
                // Evitar duplicados por ID
                if (seenIds.has(news.id)) {
                    console.warn('Noticia duplicada ignorada:', news.id);
                    return;
                }
                seenIds.add(news.id);
                
                // Filtrar por categoría
                if (!news.category || news.category.trim() !== category.trim()) {
                    return;
                }
                
                // Filtrar por búsqueda si existe
                if (searchTerm && searchTerm !== '') {
                    const titleMatch = news.title ? news.title.toLowerCase().includes(searchLower) : false;
                    const summaryMatch = news.summary ? news.summary.toLowerCase().includes(searchLower) : false;
                    const tagsMatch = news.tags ? news.tags.toLowerCase().includes(searchLower) : false;
                    
                    if (!titleMatch && !summaryMatch && !tagsMatch) {
                        return;
                    }
                }
                
                newsList.push(news);
            });
            
            // Ordenar por fecha (más reciente primero)
            newsList.sort((a, b) => {
                const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
                const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
                return dateB - dateA;
            });
            
            // Mostrar noticias
            if (newsList.length === 0) {
                let message = `No hay noticias en la categoría "${category}"`;
                if (searchTerm) {
                    message += ` con el término "${searchTerm}"`;
                }
                
                categoryNewsContainer.innerHTML = `
                    <div class="category-no-results">
                        <i class="fas fa-search"></i>
                        <h4>${message}</h4>
                        ${searchTerm ? 
                            `<button id="clear-current-category-search-public" class="back-to-all-category">
                                <i class="fas fa-times"></i> Mostrar todas las noticias de ${category}
                            </button>` 
                            : ''
                        }
                    </div>
                `;
                
                // Agregar event listener al botón de limpiar búsqueda si existe
                const clearBtn = document.getElementById('clear-current-category-search-public');
                if (clearBtn && !clearBtn.dataset.listenerAdded) {
                    clearBtn.dataset.listenerAdded = 'true';
                    clearBtn.addEventListener('click', () => {
                        categorySearchInput.value = '';
                        currentCategorySearch = '';
                        clearCategorySearchBtn.style.display = 'none';
                        loadCategoryNews(category);
                    });
                }
                isLoading = false;
                return;
            } else {
                // Mostrar contador de resultados si hay búsqueda
                if (searchTerm) {
                    const resultsInfo = document.createElement('div');
                    resultsInfo.className = 'category-search-results';
                    resultsInfo.innerHTML = `
                        <i class="fas fa-search"></i>
                        <span>Mostrando <strong>${newsList.length}</strong> noticia${newsList.length !== 1 ? 's' : ''} 
                        ${searchTerm ? `con el término "<strong>${searchTerm}</strong>"` : ''}</span>
                    `;
                    categoryNewsContainer.appendChild(resultsInfo);
                }
                
                const seenCardIds = new Set(); // Para evitar tarjetas duplicadas
                newsList.forEach(news => {
                    if (!seenCardIds.has(news.id)) {
                        seenCardIds.add(news.id);
                        const newsCard = createNewsCardForCategory(news);
                        categoryNewsContainer.appendChild(newsCard);
                    }
                });
            }
            
            isLoading = false;
            console.log(`Carga categoría #${loadId} completada: ${newsList.length} noticias`);
        })
        .catch(error => {
            if (loadId === currentLoadId) {
                categoryNewsLoading.classList.add('hidden');
                console.error('Error al cargar noticias de categoría:', error);
                categoryNewsContainer.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:30px; color:#c0392b;">
                        <h3>Error al cargar las noticias</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
            isLoading = false;
        });
}

// Crear tarjeta de noticia para vista de categoría
function createNewsCardForCategory(news) {
    if (!news || !news.id) {
        console.error('Datos de noticia inválidos:', news);
        return null;
    }
    
    const card = document.createElement('div');
    card.className = 'news-card';
    card.dataset.id = news.id;
    
    const formattedDate = formatShortDate(news.timestamp);
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
    
    // Event listener con verificación de existencia (solo una vez)
    if (!card.dataset.listenerAdded) {
        card.dataset.listenerAdded = 'true';
        card.addEventListener('click', () => {
            showNewsDetail(news.id);
        });
    }
    
    return card;
}

// Mostrar vista detallada de una noticia
function showNewsDetail(newsId) {
    currentNewsId = newsId;
    
    categoriesSection.classList.add('hidden');
    categoryDetailSection.classList.add('hidden');
    newsDetailSection.classList.remove('hidden');
    
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
                setTimeout(() => showCategories(), 2000);
            }
        })
        .catch(error => {
            console.error('Error al cargar noticia:', error);
            showMessage('Error al cargar la noticia', 'error');
            setTimeout(() => showCategories(), 2000);
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

// Volver a las categorías
function showCategories() {
    currentCategory = '';
    currentCategorySearch = '';
    
    categoriesSection.classList.remove('hidden');
    categoryDetailSection.classList.add('hidden');
    newsDetailSection.classList.add('hidden');
    
    // Resetear búsqueda en categoría
    if (categorySearchInput) {
        categorySearchInput.value = '';
    }
    if (clearCategorySearchBtn) {
        clearCategorySearchBtn.style.display = 'none';
    }
    
    loadCategories(currentSearch);
    updateURL();
    
    document.title = 'Portal de Noticias' + 
                    (currentSearch ? ` - Búsqueda: ${currentSearch}` : '');
}

// Volver a la categoría actual
function showCurrentCategory() {
    if (currentCategory) {
        showCategoryDetail(currentCategory);
    } else {
        showCategories();
    }
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
    } else if (categoryParam) {
        showCategoryDetail(categoryParam);
    } else {
        if (searchParam !== null) {
            currentSearch = searchParam;
            searchInput.value = searchParam;
        } else {
            currentSearch = '';
            searchInput.value = '';
        }
        showCategories();
    }
});

// Configurar event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Botón para volver a categorías
    if (backToCategoriesBtn && !backToCategoriesBtn.dataset.listenerAdded) {
        backToCategoriesBtn.dataset.listenerAdded = 'true';
        backToCategoriesBtn.addEventListener('click', showCategories);
    }
    
    // Botón para volver atrás
    if (backButton && !backButton.dataset.listenerAdded) {
        backButton.dataset.listenerAdded = 'true';
        backButton.addEventListener('click', showCurrentCategory);
    }
    
    // Logo para ir al inicio
    if (goHome && !goHome.dataset.listenerAdded) {
        goHome.dataset.listenerAdded = 'true';
        goHome.addEventListener('click', showCategories);
    }
    
    // Botón para compartir
    if (shareNewsBtn && !shareNewsBtn.dataset.listenerAdded) {
        shareNewsBtn.dataset.listenerAdded = 'true';
        shareNewsBtn.addEventListener('click', shareNews);
    }
});