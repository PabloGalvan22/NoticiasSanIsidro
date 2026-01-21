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

// Variables globales
let isAdmin = false;
let ckeditor = null; // Instancia de CKEditor 5
let currentDraft = null;

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
        
        // Inicializar contador
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
    
    // Configurar email predeterminado para desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        loginEmailInput.value = 'admin@ejemplo.com';
        loginPasswordInput.value = 'admin123';
    }
    
    // Cargar borrador guardado
    loadDraft();
});

// Mostrar interfaz para administrador autenticado
function showAdminUI(user) {
    isAdmin = true;
    userInfo.classList.remove('hidden');
    loginSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    
    userEmail.textContent = user.email;
    userAvatar.textContent = user.email.charAt(0).toUpperCase();
}

// Mostrar interfaz de login
function showLoginUI() {
    isAdmin = false;
    userInfo.classList.add('hidden');
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
}

// Cargar noticias para el administrador
function loadAdminNews(searchTerm = '') {
    adminNewsContainer.innerHTML = '';
    adminNewsLoading.classList.remove('hidden');
    
    let query = db.collection('news').orderBy('timestamp', 'desc');
    
    query.get()
        .then(querySnapshot => {
            adminNewsLoading.classList.add('hidden');
            
            // Actualizar contador
            newsCount.textContent = `(${querySnapshot.size})`;
            
            if (querySnapshot.empty) {
                adminNewsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No has publicado ninguna noticia aún.</p>';
                return;
            }
            
            let hasResults = false;
            
            querySnapshot.forEach(doc => {
                const news = doc.data();
                news.id = doc.id;
                
                // Filtrar por término de búsqueda si existe
                if (searchTerm && 
                    !news.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !news.summary.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !news.category.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return;
                }
                
                hasResults = true;
                const newsCard = createAdminNewsCard(news);
                adminNewsContainer.appendChild(newsCard);
            });
            
            if (!hasResults && searchTerm) {
                adminNewsContainer.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">
                        <p>No se encontraron noticias con el término: "${searchTerm}"</p>
                        <button id="clear-search" class="back-button" style="margin-top: 15px;">
                            <i class="fas fa-times"></i> Limpiar búsqueda
                        </button>
                    </div>
                `;
                
                document.getElementById('clear-search').addEventListener('click', () => {
                    searchNewsInput.value = '';
                    loadAdminNews();
                });
            }
        })
        .catch(error => {
            adminNewsLoading.classList.add('hidden');
            console.error('Error al cargar noticias:', error);
            showMessage('Error al cargar las noticias', 'error');
        });
}

// Crear tarjeta de noticia para el administrador
function createAdminNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    const formattedDate = formatShortDate(news.timestamp);
    const imageUrl = news.imageUrl || DEFAULT_IMAGE;
    const tags = news.tags ? news.tags.split(',').map(tag => tag.trim()) : [];
    
    card.innerHTML = `
        <div class="news-image" style="background-image: url('${imageUrl}')">
            ${news.featured ? '<span class="featured-badge">Destacada</span>' : ''}
        </div>
        <div class="news-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <span class="news-category">${news.category || 'General'}</span>
                <div class="news-actions-buttons">
                    <button class="edit-news" data-id="${news.id}" title="Editar" style="background: #3498db; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem; margin-right: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-news" data-id="${news.id}" title="Eliminar" style="background: #e74c3c; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h3 class="news-title">${news.title}</h3>
            <div class="news-date">
                <i class="far fa-calendar-alt"></i>
                ${formattedDate}
            </div>
            <p class="news-summary">${news.summary.substring(0, 100)}${news.summary.length > 100 ? '...' : ''}</p>
            
            ${tags.length > 0 ? `
                <div class="news-tags" style="margin-top: 10px;">
                    ${tags.map(tag => `<span style="display: inline-block; background: #eef2ff; color: #4a6fc1; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; margin-right: 5px; margin-bottom: 5px;">#${tag}</span>`).join('')}
                </div>
            ` : ''}
            
            <div style="margin-top: 15px; font-size: 0.85rem; color: #666;">
                <i class="fas fa-user"></i> ${news.author || 'Administrador'}
            </div>
        </div>
    `;
    
    // Agregar event listeners
    const deleteBtn = card.querySelector('.delete-news');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const newsId = this.getAttribute('data-id');
        deleteNews(newsId);
    });
    
    const editBtn = card.querySelector('.edit-news');
    editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const newsId = this.getAttribute('data-id');
        editNews(newsId);
    });
    
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
                
                // Rellenar formulario con datos existentes
                document.getElementById('news-title').value = news.title || '';
                document.getElementById('news-category').value = news.category || '';
                document.getElementById('news-image').value = news.imageUrl || '';
                document.getElementById('news-summary').value = news.summary || '';
                document.getElementById('news-tags').value = news.tags || '';
                document.getElementById('news-video').value = news.videoUrl || '';
                
                // Actualizar CKEditor
                if (ckeditor) {
                    ckeditor.setData(news.content || '');
                } else {
                    document.getElementById('news-content').value = news.content || '';
                }
                
                // Actualizar contador de caracteres
                if (summaryChars) {
                    summaryChars.textContent = news.summary ? news.summary.length : 0;
                }
                
                // Guardar ID para actualizar en lugar de crear nuevo
                newsForm.dataset.editingId = newsId;
                publishNewsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Noticia';
                
                // Desplazarse al formulario
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
            
            // Mostrar opción para restaurar
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
    
    // Validación
    if (!title || !category || !summary || !content) {
        showMessage('Por favor, completa todos los campos obligatorios', 'error');
        return;
    }
    
    // Crear objeto de noticia
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
    
    // Mostrar estado de carga
    publishNewsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    publishNewsBtn.disabled = true;
    
    let promise;
    
    if (isEditing) {
        // Actualizar noticia existente
        promise = db.collection('news').doc(isEditing).update(newsItem);
    } else {
        // Crear nueva noticia
        promise = db.collection('news').add(newsItem);
    }
    
    promise
        .then((result) => {
            // Limpiar formulario
            newsForm.reset();
            if (ckeditor) {
                ckeditor.setData('');
            } else {
                document.getElementById('news-content').value = '';
            }
            
            // Limpiar modo edición
            delete newsForm.dataset.editingId;
            publishNewsBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Noticia';
            
            // Limpiar borrador
            localStorage.removeItem('newsDraft');
            currentDraft = null;
            
            // Mostrar mensaje de éxito
            const message = isEditing ? 
                '¡Noticia actualizada exitosamente!' : 
                '¡Noticia publicada exitosamente!';
            showMessage(message, 'success');
            
            // Recargar lista de noticias
            loadAdminNews();
            
            // Cerrar modal de vista previa si está abierto
            previewModal.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error al publicar noticia:', error);
            showMessage('Error: ' + error.message, 'error');
        })
        .finally(() => {
            // Restaurar botón
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
    
    // Validación básica
    if (!title || !category || !summary || !content) {
        showMessage('Completa todos los campos obligatorios para ver la vista previa', 'warning');
        return;
    }
    
    const imageToUse = imageUrl || DEFAULT_IMAGE;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Crear vista previa en el modal
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
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId;
        
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
            return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
    } else if (videoUrl.includes('vimeo.com')) {
        const videoId = videoUrl.split('vimeo.com/')[1];
        if (videoId) {
            return `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        }
    }
    
    return `<p>Enlace de video no compatible. URL: <a href="${videoUrl}" target="_blank">${videoUrl}</a></p>`;
}

// Iniciar sesión
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
            showMessage('Inicio de sesión exitoso', 'success');
            
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

// Event Listeners
if (submitLoginBtn) submitLoginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (newsForm) newsForm.addEventListener('submit', publishNews);
if (previewNewsBtn) previewNewsBtn.addEventListener('click', previewNews);
if (saveDraftBtn) saveDraftBtn.addEventListener('click', saveDraft);
if (resetFormBtn) resetFormBtn.addEventListener('click', () => {
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
if (refreshNewsBtn) refreshNewsBtn.addEventListener('click', () => {
    loadAdminNews(searchNewsInput.value);
    showMessage('Lista actualizada', 'success');
});
if (searchNewsInput) {
    searchNewsInput.addEventListener('input', (e) => {
        loadAdminNews(e.target.value);
    });
}
if (closePreviewBtn) closePreviewBtn.addEventListener('click', () => {
    previewModal.classList.add('hidden');
});
if (editFromPreviewBtn) editFromPreviewBtn.addEventListener('click', () => {
    previewModal.classList.add('hidden');
});
if (publishFromPreviewBtn) publishFromPreviewBtn.addEventListener('click', () => {
    publishNewsBtn.click();
    previewModal.classList.add('hidden');
});

// Permitir enviar el formulario con Enter en los campos de login
if (loginPasswordInput) {
    loginPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login();
        }
    });
}

// Cerrar modal al hacer clic fuera
previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        previewModal.classList.add('hidden');
    }
});