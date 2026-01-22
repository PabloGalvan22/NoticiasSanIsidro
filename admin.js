// Referencias a elementos del DOM
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const userInfo = document.getElementById('user-info');
const userAvatar = document.getElementById('user-avatar');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const submitLoginBtn = document.getElementById('submit-login');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginStatus = document.getElementById('login-status');
const newsForm = document.getElementById('news-form');
const publishStatus = document.getElementById('publish-status');
const adminNewsContainer = document.getElementById('admin-news-container');
const adminNewsLoading = document.getElementById('admin-news-loading');
const newsCount = document.getElementById('news-count');
const publishNewsBtn = document.getElementById('publish-news');
const previewNewsBtn = document.getElementById('preview-news');
const saveDraftBtn = document.getElementById('save-draft');
const resetFormBtn = document.getElementById('reset-form');
const refreshNewsBtn = document.getElementById('refresh-news');
const searchNewsInput = document.getElementById('search-news');
const previewModal = document.getElementById('preview-modal');
const closePreviewBtn = document.getElementById('close-preview');
const previewModalBody = document.getElementById('preview-modal-body');
const editFromPreviewBtn = document.getElementById('edit-from-preview');
const publishFromPreviewBtn = document.getElementById('publish-from-preview');
const summaryChars = document.getElementById('summary-chars');
const adminCategoryFilter = document.getElementById('admin-category-filter');
const forceReloadBtn = document.getElementById('force-reload');

// Variables globales
let isAdmin = false;
let ckeditor = null;
let currentDraft = null;
let isAdminLoading = false;
let currentAdminLoadId = 0;

// Inicializar CKEditor 5
function initCKEditor() {
    const editorElement = document.getElementById('news-content');
    if (!editorElement || typeof ClassicEditor === 'undefined') {
        console.warn('CKEditor no está disponible');
        editorElement.style.display = 'block';
        editorElement.style.minHeight = '400px';
        return;
    }
    
    ClassicEditor
        .create(editorElement, {
            toolbar: {
                items: [
                    'heading', '|',
                    'bold', 'italic', 'underline', '|',
                    'link', 'bulletedList', 'numberedList', '|',
                    'blockQuote', 'insertTable', '|',
                    'undo', 'redo'
                ]
            },
            language: 'es'
        })
        .then(editor => {
            console.log('CKEditor 5 cargado exitosamente');
            ckeditor = editor;
        })
        .catch(error => {
            console.error('Error al cargar CKEditor:', error);
            editorElement.style.display = 'block';
            editorElement.style.minHeight = '400px';
        });
}

// Contador de caracteres para resumen
function initSummaryCounter() {
    const summaryInput = document.getElementById('news-summary');
    if (summaryInput && summaryChars) {
        summaryInput.addEventListener('input', function() {
            const length = this.value.length;
            summaryChars.textContent = length;
            
            summaryChars.classList.remove('warning', 'error');
            if (length > 150) {
                summaryChars.classList.add('warning');
            }
            if (length > 200) {
                summaryChars.classList.add('error');
            }
        });
        
        summaryChars.textContent = summaryInput.value.length;
    }
}

// Estado de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
        if (user) {
            showAdminUI(user);
            loadAdminNews();
            initCKEditor();
            initSummaryCounter();
        } else {
            showLoginUI();
        }
    });

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        loginEmailInput.value = 'admin@ejemplo.com';
        loginPasswordInput.value = 'admin123';
    }
    
    loadDraft();
    
    setupEventListeners();
});

// Función para configurar event listeners una sola vez
function setupEventListeners() {
    // Login
    if (submitLoginBtn && !submitLoginBtn.dataset.listenerAdded) {
        submitLoginBtn.dataset.listenerAdded = 'true';
        submitLoginBtn.addEventListener('click', login);
    }
    
    // Logout
    if (logoutBtn && !logoutBtn.dataset.listenerAdded) {
        logoutBtn.dataset.listenerAdded = 'true';
        logoutBtn.addEventListener('click', logout);
    }
    
    // Formulario de noticias
    if (newsForm && !newsForm.dataset.listenerAdded) {
        newsForm.dataset.listenerAdded = 'true';
        newsForm.addEventListener('submit', publishNews);
    }
    
    // Botones del formulario
    if (previewNewsBtn && !previewNewsBtn.dataset.listenerAdded) {
        previewNewsBtn.dataset.listenerAdded = 'true';
        previewNewsBtn.addEventListener('click', previewNews);
    }
    
    if (saveDraftBtn && !saveDraftBtn.dataset.listenerAdded) {
        saveDraftBtn.dataset.listenerAdded = 'true';
        saveDraftBtn.addEventListener('click', saveDraft);
    }
    
    if (resetFormBtn && !resetFormBtn.dataset.listenerAdded) {
        resetFormBtn.dataset.listenerAdded = 'true';
        resetFormBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán los cambios no guardados.')) {
                newsForm.reset();
                if (ckeditor) {
                    ckeditor.setData('');
                } else {
                    document.getElementById('news-content').value = '';
                }
                delete newsForm.dataset.editingId;
                publishNewsBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Noticia';
                if (summaryChars) {
                    summaryChars.textContent = '0';
                }
                showMessage('Formulario limpiado', 'success');
            }
        });
    }
    
    // Búsqueda y filtros con debounce
    let searchDebounceTimer;
    if (searchNewsInput) {
        searchNewsInput.addEventListener('input', function() {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                loadAdminNews(this.value, adminCategoryFilter ? adminCategoryFilter.value : '');
            }, 500);
        });
    }
    
    let categoryDebounceTimer;
    if (adminCategoryFilter) {
        adminCategoryFilter.addEventListener('change', function() {
            clearTimeout(categoryDebounceTimer);
            categoryDebounceTimer = setTimeout(() => {
                loadAdminNews(searchNewsInput.value, this.value);
            }, 300);
        });
    }
    
    // Botón de actualizar
    if (refreshNewsBtn && !refreshNewsBtn.dataset.listenerAdded) {
        refreshNewsBtn.dataset.listenerAdded = 'true';
        refreshNewsBtn.addEventListener('click', () => {
            loadAdminNews(searchNewsInput.value, adminCategoryFilter ? adminCategoryFilter.value : '');
            showMessage('Lista actualizada', 'success');
        });
    }
    
    // Botón de recarga forzada
    if (forceReloadBtn && !forceReloadBtn.dataset.listenerAdded) {
        forceReloadBtn.dataset.listenerAdded = 'true';
        forceReloadBtn.addEventListener('click', forceReloadNews);
    }
    
    // Modal de vista previa
    if (closePreviewBtn && !closePreviewBtn.dataset.listenerAdded) {
        closePreviewBtn.dataset.listenerAdded = 'true';
        closePreviewBtn.addEventListener('click', () => {
            previewModal.classList.add('hidden');
        });
    }
    
    if (editFromPreviewBtn && !editFromPreviewBtn.dataset.listenerAdded) {
        editFromPreviewBtn.dataset.listenerAdded = 'true';
        editFromPreviewBtn.addEventListener('click', () => {
            previewModal.classList.add('hidden');
        });
    }
    
    if (publishFromPreviewBtn && !publishFromPreviewBtn.dataset.listenerAdded) {
        publishFromPreviewBtn.dataset.listenerAdded = 'true';
        publishFromPreviewBtn.addEventListener('click', () => {
            publishNewsBtn.click();
            previewModal.classList.add('hidden');
        });
    }
    
    // Cerrar modal al hacer clic fuera
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.classList.add('hidden');
        }
    });
    
    // Permitir Enter en login
    if (loginPasswordInput) {
        loginPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
}

function showAdminUI(user) {
    isAdmin = true;
    userInfo.classList.remove('hidden');
    loginSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    
    userEmail.textContent = user.email;
    userAvatar.textContent = user.email.charAt(0).toUpperCase();
}

function showLoginUI() {
    isAdmin = false;
    userInfo.classList.add('hidden');
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
}

// Cargar noticias para el administrador - VERSIÓN CORREGIDA SIN DUPLICADOS
function loadAdminNews(searchTerm = '', category = '') {
    if (isAdminLoading) {
        console.log('Carga de admin en progreso, ignorando...');
        return;
    }
    
    const loadId = ++currentAdminLoadId;
    console.log(`Iniciando carga admin #${loadId}`, { searchTerm, category });
    
    isAdminLoading = true;
    adminNewsContainer.innerHTML = '';
    adminNewsLoading.classList.remove('hidden');
    
    let query = db.collection('news').orderBy('timestamp', 'desc');
    
    query.get()
        .then(querySnapshot => {
            // Verificar si es la carga más reciente
            if (loadId !== currentAdminLoadId) {
                console.log(`Carga admin #${loadId} obsoleta`);
                isAdminLoading = false;
                return;
            }
            
            adminNewsLoading.classList.add('hidden');
            
            let totalCount = querySnapshot.size;
            let filteredCount = 0;
            const newsToDisplay = [];
            const seenIds = new Set();
            const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
            
            if (querySnapshot.empty) {
                adminNewsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No hay noticias publicadas.</p>';
                newsCount.textContent = '(0)';
                isAdminLoading = false;
                return;
            }
            
            querySnapshot.forEach(doc => {
                const news = doc.data();
                news.id = doc.id;
                
                // Prevenir duplicados
                if (seenIds.has(news.id)) {
                    console.warn('Noticia duplicada en admin:', news.id);
                    return;
                }
                seenIds.add(news.id);
                
                if (category && category !== '') {
                    if (!news.category || news.category.trim() !== category.trim()) {
                        return;
                    }
                }
                
                if (searchTerm) {
                    const titleMatch = news.title ? news.title.toLowerCase().includes(searchLower) : false;
                    const summaryMatch = news.summary ? news.summary.toLowerCase().includes(searchLower) : false;
                    const tagsMatch = news.tags ? news.tags.toLowerCase().includes(searchLower) : false;
                    
                    if (!titleMatch && !summaryMatch && !tagsMatch) {
                        return;
                    }
                }
                
                filteredCount++;
                newsToDisplay.push(news);
            });
            
            // Ordenar por fecha
            newsToDisplay.sort((a, b) => {
                const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
                const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
                return dateB - dateA;
            });
            
            if (newsToDisplay.length === 0) {
                let message = 'No se encontraron noticias';
                if (category) message += ` en la categoría "${category}"`;
                if (searchTerm) message += ` con el término "${searchTerm}"`;
                
                adminNewsContainer.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">
                        <p>${message}</p>
                        <button id="clear-all-filters" class="back-button" style="margin-top: 15px;">
                            <i class="fas fa-times"></i> Limpiar todos los filtros
                        </button>
                    </div>
                `;
                
                const clearBtn = document.getElementById('clear-all-filters');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        searchNewsInput.value = '';
                        if (adminCategoryFilter) adminCategoryFilter.value = '';
                        loadAdminNews();
                    });
                }
            } else {
                newsToDisplay.forEach(news => {
                    const newsCard = createAdminNewsCard(news);
                    adminNewsContainer.appendChild(newsCard);
                });
            }
            
            let countText = `(${filteredCount}`;
            if (filteredCount !== totalCount) {
                countText += ` de ${totalCount}`;
            }
            countText += ')';
            newsCount.textContent = countText;
            
            console.log(`Carga admin #${loadId} completada: ${filteredCount} de ${totalCount}`);
        })
        .catch(error => {
            if (loadId === currentAdminLoadId) {
                adminNewsLoading.classList.add('hidden');
                console.error('Error al cargar noticias:', error);
                showMessage('Error al cargar las noticias', 'error');
            }
        })
        .finally(() => {
            if (loadId === currentAdminLoadId) {
                isAdminLoading = false;
            }
        });
}

// Crear tarjeta de noticia para el administrador
function createAdminNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.dataset.id = news.id;
    
    const formattedDate = formatShortDate(news.timestamp);
    const imageUrl = news.imageUrl || DEFAULT_IMAGE;
    
    card.innerHTML = `
        <div class="news-image ${news.videoUrl ? 'has-video' : ''}" 
            style="background-image: url('${imageUrl}')">
        </div>
        <div class="news-content">
            <div class="news-card-header">
                <span class="news-category">${news.category || 'General'}</span>
                <div class="news-card-actions">
                    <button class="edit-news" data-id="${news.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-news" data-id="${news.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
            <h3 class="news-title">${news.title}</h3>
            <div class="news-date">
                <i class="far fa-calendar-alt"></i>
                ${formattedDate}
                ${news.videoUrl ? ' <i class="fas fa-video" style="margin-left:10px;color:#ff0000;"></i>' : ''}
            </div>
            <p class="news-summary">${news.summary}</p>
            <div class="read-more">Leer más <i class="fas fa-arrow-right"></i></div>
        </div>
    `;
    
    // Agregar event listeners únicos
    const deleteBtn = card.querySelector('.delete-news');
    if (deleteBtn && !deleteBtn.dataset.listenerAdded) {
        deleteBtn.dataset.listenerAdded = 'true';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const newsId = this.getAttribute('data-id');
            deleteNews(newsId);
        });
    }
    
    const editBtn = card.querySelector('.edit-news');
    if (editBtn && !editBtn.dataset.listenerAdded) {
        editBtn.dataset.listenerAdded = 'true';
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const newsId = this.getAttribute('data-id');
            editNews(newsId);
        });
    }
    
    // Listener para la tarjeta
    if (!card.dataset.listenerAdded) {
        card.dataset.listenerAdded = 'true';
        card.addEventListener('click', () => {
            window.open(`index.html?news=${news.id}`, '_blank');
        });
    }
    
    return card;
}

// Eliminar una noticia
function deleteNews(newsId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer.')) {
        return;
    }
    
    db.collection('news').doc(newsId).delete()
        .then(() => {
            showMessage('Noticia eliminada exitosamente', 'success');
            loadAdminNews();
        })
        .catch(error => {
            console.error('Error al eliminar noticia:', error);
            showMessage('Error al eliminar la noticia', 'error');
        });
}

// Editar una noticia
function editNews(newsId) {
    db.collection('news').doc(newsId).get()
        .then(doc => {
            if (doc.exists) {
                const news = doc.data();
                
                document.getElementById('news-title').value = news.title || '';
                document.getElementById('news-category').value = news.category || '';
                document.getElementById('news-image').value = news.imageUrl || '';
                document.getElementById('news-summary').value = news.summary || '';
                document.getElementById('news-tags').value = news.tags || '';
                document.getElementById('news-video').value = news.videoUrl || '';
                
                if (ckeditor) {
                    ckeditor.setData(news.content || '');
                } else {
                    document.getElementById('news-content').value = news.content || '';
                }
                
                if (summaryChars) {
                    summaryChars.textContent = news.summary ? news.summary.length : 0;
                }
                
                newsForm.dataset.editingId = newsId;
                publishNewsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Noticia';
                
                document.getElementById('news-title').scrollIntoView({ behavior: 'smooth' });
                
                showMessage('Modo edición activado. Los cambios se guardarán sobre la noticia existente.', 'success');
            }
        })
        .catch(error => {
            console.error('Error al cargar noticia para editar:', error);
            showMessage('Error al cargar la noticia para editar', 'error');
        });
}

// Guardar borrador en localStorage
function saveDraft() {
    const draft = {
        title: document.getElementById('news-title').value.trim(),
        category: document.getElementById('news-category').value,
        imageUrl: document.getElementById('news-image').value.trim(),
        summary: document.getElementById('news-summary').value.trim(),
        content: ckeditor ? ckeditor.getData() : document.getElementById('news-content').value.trim(),
        tags: document.getElementById('news-tags').value.trim(),
        videoUrl: document.getElementById('news-video').value.trim(),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('newsDraft', JSON.stringify(draft));
    currentDraft = draft;
    
    showMessage('Borrador guardado localmente', 'success');
}

// Cargar borrador desde localStorage
function loadDraft() {
    const draftStr = localStorage.getItem('newsDraft');
    if (draftStr) {
        try {
            currentDraft = JSON.parse(draftStr);
            
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'back-button';
            restoreBtn.innerHTML = '<i class="fas fa-history"></i> Restaurar Borrador';
            restoreBtn.style.marginTop = '10px';
            restoreBtn.addEventListener('click', restoreDraft);
            
            document.getElementById('news-form').appendChild(restoreBtn);
            
            showMessage('Tienes un borrador guardado. Puedes restaurarlo con el botón "Restaurar Borrador".', 'warning');
        } catch (e) {
            console.error('Error al cargar borrador:', e);
        }
    }
}

// Restaurar borrador
function restoreDraft() {
    if (!currentDraft || !confirm('¿Restaurar el borrador guardado? Esto sobrescribirá los datos actuales del formulario.')) {
        return;
    }
    
    document.getElementById('news-title').value = currentDraft.title || '';
    document.getElementById('news-category').value = currentDraft.category || '';
    document.getElementById('news-image').value = currentDraft.imageUrl || '';
    document.getElementById('news-summary').value = currentDraft.summary || '';
    document.getElementById('news-tags').value = currentDraft.tags || '';
    document.getElementById('news-video').value = currentDraft.videoUrl || '';
    
    if (ckeditor) {
        ckeditor.setData(currentDraft.content || '');
    } else {
        document.getElementById('news-content').value = currentDraft.content || '';
    }
    
    if (summaryChars) {
        summaryChars.textContent = currentDraft.summary ? currentDraft.summary.length : 0;
    }
    
    showMessage('Borrador restaurado', 'success');
}

// Publicar nueva noticia
function publishNews(event) {
    event.preventDefault();
    
    const title = document.getElementById('news-title').value.trim();
    const category = document.getElementById('news-category').value;
    const imageUrl = document.getElementById('news-image').value.trim();
    const summary = document.getElementById('news-summary').value.trim();
    const content = ckeditor ? ckeditor.getData() : document.getElementById('news-content').value.trim();
    const tags = document.getElementById('news-tags').value.trim();
    const videoUrl = document.getElementById('news-video').value.trim();
    const isEditing = newsForm.dataset.editingId;
    
    if (!title || !category || !summary || !content) {
        showMessage('Por favor, completa todos los campos obligatorios', 'error');
        return;
    }
    
    const newsItem = {
        title,
        category,
        imageUrl: imageUrl || DEFAULT_IMAGE,
        summary,
        content,
        tags,
        videoUrl,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser.email,
        authorId: auth.currentUser.uid,
        lastModified: new Date().toISOString()
    };
    
    publishNewsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    publishNewsBtn.disabled = true;
    
    let promise;
    
    if (isEditing) {
        promise = db.collection('news').doc(isEditing).update(newsItem);
    } else {
        promise = db.collection('news').add(newsItem);
    }
    
    promise
        .then((result) => {
            newsForm.reset();
            if (ckeditor) {
                ckeditor.setData('');
            } else {
                document.getElementById('news-content').value = '';
            }
            
            delete newsForm.dataset.editingId;
            publishNewsBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Noticia';
            
            localStorage.removeItem('newsDraft');
            currentDraft = null;
            
            const message = isEditing ? 
                '¡Noticia actualizada exitosamente!' : 
                '¡Noticia publicada exitosamente!';
            showMessage(message, 'success');
            
            loadAdminNews();
            
            previewModal.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error al publicar noticia:', error);
            showMessage('Error: ' + error.message, 'error');
        })
        .finally(() => {
            publishNewsBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Noticia';
            publishNewsBtn.disabled = false;
        });
}

// Vista previa completa de la noticia
function previewNews() {
    const title = document.getElementById('news-title').value.trim();
    const category = document.getElementById('news-category').value;
    const imageUrl = document.getElementById('news-image').value.trim();
    const summary = document.getElementById('news-summary').value.trim();
    const content = ckeditor ? ckeditor.getData() : document.getElementById('news-content').value.trim();
    const tags = document.getElementById('news-tags').value.trim();
    const videoUrl = document.getElementById('news-video').value.trim();
    
    if (!title || !category || !summary || !content) {
        showMessage('Completa todos los campos obligatorios para ver la vista previa', 'warning');
        return;
    }
    
    const imageToUse = imageUrl || DEFAULT_IMAGE;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    previewModalBody.innerHTML = `
        <div class="news-detail-container">
            <div class="news-detail-header">
                <div class="news-detail-meta">
                    <span class="news-category news-detail-category">${category || 'General'}</span>
                    <span class="news-detail-author">Por: ${auth.currentUser ? auth.currentUser.email : 'Administrador'}</span>
                </div>
                <h1 class="news-detail-title">${title}</h1>
                <div class="news-date">
                    <i class="far fa-calendar-alt"></i>
                    <span>${new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
            </div>
            
            <div class="news-detail-image" style="background-image: url('${imageToUse}')"></div>
            
            <div class="news-detail-body">
                <h3 class="news-summary-large">${summary}</h3>
                
                ${videoUrl ? `
                    <div class="video-container">
                        ${getVideoEmbedCode(videoUrl)}
                    </div>
                ` : ''}
                
                <div class="news-detail-content">
                    ${content}
                </div>
                
                ${tagsArray.length > 0 ? `
                    <div class="news-tags" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <strong>Etiquetas:</strong>
                        ${tagsArray.map(tag => `<span style="display: inline-block; background: #eef2ff; color: #4a6fc1; padding: 5px 10px; border-radius: 15px; font-size: 0.9rem; margin-right: 8px; margin-bottom: 8px;">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="news-detail-footer">
                <span>Portal de Noticias - Vista Previa</span>
                <span style="color: #f39c12;"><i class="fas fa-eye"></i> Vista previa - No publicado</span>
            </div>
        </div>
    `;
    
    previewModal.classList.remove('hidden');
}

// Obtener código de inserción para videos
function getVideoEmbedCode(videoUrl) {
    if (!videoUrl || typeof videoUrl !== 'string') return '';
    
    let url = videoUrl.trim();
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        if (url.includes('youtube.com/watch?v=')) {
            const match = url.match(/v=([a-zA-Z0-9_-]+)/);
            videoId = match ? match[1] : '';
        }
        else if (url.includes('youtu.be/')) {
            const parts = url.split('youtu.be/');
            videoId = parts[1] ? parts[1].split(/[?&#]/)[0] : '';
        }
        else if (url.includes('youtube.com/embed/')) {
            const parts = url.split('embed/');
            videoId = parts[1] ? parts[1].split(/[?&#]/)[0] : '';
        }
        
        if (videoId) {
            return `<div class="video-embed">
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
                <p class="video-note"><i class="fas fa-video"></i> Video de YouTube</p>
            </div>`;
        }
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        if (match && match[1]) {
            return `<div class="video-embed">
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://player.vimeo.com/video/${match[1]}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen>
                </iframe>
                <p class="video-note"><i class="fas fa-video"></i> Video de Vimeo</p>
            </div>`;
        }
    }
    
    return `<div class="video-link">
        <p><i class="fas fa-external-link-alt"></i> Enlace de video: 
        <a href="${url}" target="_blank">${url}</a></p>
    </div>`;
}

// Función login
function login() {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;
    
    if (!email || !password) {
        showMessage('Por favor, ingresa correo y contraseña', 'error');
        return;
    }
    
    submitLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    submitLoginBtn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            submitLoginBtn.innerHTML = 'Acceder';
            submitLoginBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error de autenticación:', error);
            
            let errorMessage = 'Error al iniciar sesión';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Usuario no encontrado';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Contraseña incorrecta';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Correo electrónico inválido';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
            }
            
            showMessage(errorMessage, 'error');
            
            submitLoginBtn.innerHTML = 'Acceder';
            submitLoginBtn.disabled = false;
        });
}

// Cerrar sesión
function logout() {
    auth.signOut()
        .then(() => {
            showMessage('Sesión cerrada exitosamente', 'success');
        })
        .catch(error => {
            console.error('Error al cerrar sesión:', error);
            showMessage('Error al cerrar sesión', 'error');
        });
}

// Mostrar mensaje
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

// Función para forzar recarga completa
function forceReloadNews() {
    console.log('Forzando recarga completa...');
    currentAdminLoadId = 0;
    loadAdminNews(searchNewsInput.value, adminCategoryFilter ? adminCategoryFilter.value : '');
    showMessage('Recarga forzada completada', 'success');
}

// Función debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}