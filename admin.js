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
const adminCategoriesContainer = document.getElementById('admin-categories-container');
const adminNewsContainer = document.getElementById('admin-news-container');
const adminNewsLoading = document.getElementById('admin-news-loading');
const adminCategoryDetail = document.getElementById('admin-category-detail');
const adminCategoryNewsContainer = document.getElementById('admin-category-news-container');
const adminCategoryTitle = document.getElementById('admin-category-title');
const backToCategoriesAdminBtn = document.getElementById('back-to-categories-admin');
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
const viewCategoriesBtn = document.getElementById('view-categories');
const viewListBtn = document.getElementById('view-list');

// Referencias para búsqueda en categoría
const categorySearchInput = document.getElementById('category-search-input');
const clearCategorySearchBtn = document.getElementById('clear-category-search');

// Referencias para funcionalidad de imágenes
const newsImageInput = document.getElementById('news-image');
const testImageUrlBtn = document.getElementById('test-image-url');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image');
const testImgBtns = document.querySelectorAll('.test-img-btn');

// Variables globales
let isAdmin = false;
let ckeditor = null;
let currentDraft = null;
let isAdminLoading = false;
let currentAdminLoadId = 0;
let currentViewMode = 'categories';
let currentAdminCategory = '';
let currentCategorySearch = '';

// Colores para cada categoría
const categoryColors = {
    'Tecnología': '#2400f2',
    'Salud': '#6bc4ff',
    'Internacional': '#ff9d00',
    'Educación': '#27ae60',
    'Ciencia': '#ff00d4',
    'Ayudas': '#ff0000',
    'Comunitaria': '#e3ea00',
    'Seguridad Publica': '#d400ff',
    'General': '#d5cdcd'
};

// Iconos para cada categoría
const categoryIcons = {
    'Tecnología': 'fa-microchip',
    'Salud': 'fa-heartbeat',
    'Internacional': 'fa-globe-americas',
    'Educación': 'fa-graduation-cap',
    'Ciencia': 'fa-flask',
    'Ayudas': 'fa-hands-helping',
    'Comunitaria': 'fa-home',
    'Seguridad Publica': 'fa-lock',
    'General': 'fa-newspaper'
};

// Imágenes de prueba por categoría
const testImages = {
    'tecnologia': [
        'https://thumbs.dreamstime.com/b/programador-escribir-c%C3%B3digo-en-computadoras-de-escritorio-desarrollar-el-concepto-tecnolog%C3%ADas-programaci%C3%B3n-y-codificaci%C3%B3n-169718214.jpg',
        'https://img.freepik.com/fotos-premium/vr-auriculares-computadora-portatil-fondo-azul-concepto-vr-juego-simular-tecnologia_34777-318.jpg?semt=ais_hybrid&w=740',
        'https://thumbs.dreamstime.com/b/ro-exposici%C3%B3n-internacional-de-la-rob%C3%B3tica-y-de-las-tecnolog%C3%ADas-avanzadas-62956671.jpg',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHRlY2hub2xvZ3l8ZW58MHx8MHx8fDA=',
        'https://plus.unsplash.com/premium_photo-1681426687411-21986b0626a8?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG51ZXZhJTIwdGVjbm9sb2clQzMlQURhfGVufDB8fDB8fHww',
        'https://thumbs.dreamstime.com/b/tecnolog%C3%ADa-moderna-artilugios-106675293.jpg',
        'https://cdn.pixabay.com/photo/2020/04/09/18/07/future-5022544_640.jpg'
    ],
    'salud': [
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://media.istockphoto.com/id/1363774646/es/vector/salud-mental.jpg?s=612x612&w=0&k=20&c=7dG5StYXYTtwg58eLde9b4eHLIJ4gwF26Q6iN-LxN2c=',
        'https://media.gettyimages.com/id/2180039271/es/foto/mental-health-concept.jpg?s=612x612&w=0&k=20&c=Uw2rP3W7h3RmnGDUzKF1any4xZBsvdoDZxMSDg24z_8=',
        'https://media.gettyimages.com/id/2086018126/es/foto/concepto-de-alimentaci%C3%B3n-saludable-y-ejercicio.jpg?s=612x612&w=0&k=20&c=ifHWqtVw8YQjr9fMkusGkWtpXGRqWbcfo0miKw3qHbQ='
    ],
    'ciencia':[
        'https://wallpapers.com/images/hd/science-pictures-bveq545pfv117m5k.jpg',
        'https://media.gettyimages.com/id/2150630975/es/foto/scientist-uses-pipette-to-remove-sample-from-petri-dish.jpg?s=612x612&w=0&k=20&c=2sufyWfS0RGVZFuXz0_ZWJhS-bF8i1fTWmc7lp3Umi8=',
        'https://wallpapers.com/images/hd/science-pictures-fccoxonnfsz54te3.jpg',
        'https://media.istockphoto.com/id/2163767427/es/foto/microscopio-control-de-la-mujer-e-investigaci%C3%B3n-de-virus-del-estudio-de-la-ciencia-con-el.jpg?s=612x612&w=0&k=20&c=fR36b9-VZ178llNJe3_5SiKqAV9fFMupwSzL6BvB1HE=',
        'https://media.istockphoto.com/id/1440495095/photo/laboratory-investigations-concerning-test-and-medicine-against-covid.jpg?b=1&s=612x612&w=0&k=20&c=Og-YVEk-IS89vax1d0CBLfHaDGHyXfVNZUI3oQVFXC4=',
        ''
    ],
    'astronomia':[
        'https://i.pinimg.com/originals/2f/f7/94/2ff7944f1adf4b7e04c45e8c192d16ae.jpg',
        'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/general/images/2023/06/b/bh-accretion-disk-sim-360-4k-prores.00001-print.jpg?w=1024&h=1024&fit=clip&crop=faces,focalpoint',
        'https://e01-elmundo.uecdn.es/assets/multimedia/imagenes/2025/11/28/17643339955825.gif',
        'https://upload.wikimedia.org/wikipedia/commons/4/4d/NASA_Apollo_17_Lunar_Roving_Vehicle.jpg',
        'https://www.nasa.gov/wp-content/uploads/2026/02/55093881630-42e655abce-o.jpg',
        'https://cdn.pixabay.com/photo/2011/12/13/14/31/earth-11015_640.jpg'
    ],
    'general': [ 
        'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
};

// Probar URL de imagen
function testImageUrl() {
    const url = newsImageInput.value.trim();
    
    if (!url) {
        showMessage('Por favor, ingresa una URL de imagen', 'warning');
        return;
    }
    
    // Validar que sea una URL válida
    try {
        new URL(url);
    } catch (e) {
        showMessage('URL inválida. Por favor, ingresa una URL completa (comenzando con http:// o https://)', 'error');
        return;
    }
    
    testImageUrlBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Probando...';
    testImageUrlBtn.disabled = true;
    
    // Crear imagen para probar
    const img = new Image();
    
    img.onload = function() {
        // Mostrar vista previa
        imagePreview.innerHTML = `
            <div class="preview-success">
                <i class="fas fa-check-circle"></i>
                <p>¡URL válida! Imagen cargada correctamente.</p>
                <div class="preview-img" style="background-image: url('${url}')"></div>
                <div class="preview-info">
                    <p><strong>Tamaño:</strong> ${img.naturalWidth} x ${img.naturalHeight} px</p>
                    <p><strong>Formato:</strong> ${url.split('.').pop().toUpperCase()}</p>
                </div>
            </div>
        `;
        imagePreviewContainer.classList.remove('hidden');
        
        testImageUrlBtn.innerHTML = '<i class="fas fa-check"></i> Probar URL';
        testImageUrlBtn.disabled = false;
        
        showMessage('¡URL de imagen válida! Vista previa cargada.', 'success');
    };
    
    img.onerror = function() {
        imagePreview.innerHTML = `
            <div class="preview-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>No se pudo cargar la imagen. Verifica que la URL sea correcta y la imagen sea accesible.</p>
                <p class="error-tip">Consejo: Asegúrate de usar una URL directa a la imagen (que termine en .jpg, .png, etc.)</p>
            </div>
        `;
        imagePreviewContainer.classList.remove('hidden');
        
        testImageUrlBtn.innerHTML = '<i class="fas fa-check"></i> Probar URL';
        testImageUrlBtn.disabled = false;
        
        showMessage('Error al cargar la imagen. Verifica la URL.', 'error');
    };
    
    // Establecer timeout
    setTimeout(() => {
        if (!img.complete) {
            img.src = ''; // Cancelar carga
            testImageUrlBtn.innerHTML = '<i class="fas fa-check"></i> Probar URL';
            testImageUrlBtn.disabled = false;
            showMessage('Tiempo de espera agotado. La imagen tardó demasiado en cargar.', 'error');
        }
    }, 10000);
    
    img.src = url;
}

// Cargar imagen de prueba
function loadTestImage(category) {
    if (!testImages[category]) {
        showMessage('Categoría no encontrada', 'error');
        return;
    }
    
    const images = testImages[category];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    
    newsImageInput.value = randomImage;
    testImageUrl(); // Probar automáticamente
    
    showMessage(`Imagen de prueba (${category}) cargada`, 'success');
}

// Remover imagen
function removeImage() {
    newsImageInput.value = '';
    imagePreviewContainer.classList.add('hidden');
    showMessage('Imagen removida', 'success');
}

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

// Inicializar funcionalidad de imágenes
function initImageFunctionality() {
    // Event listener para probar URL
    if (testImageUrlBtn) {
        testImageUrlBtn.addEventListener('click', testImageUrl);
    }
    
    // Event listener para remover imagen
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removeImage);
    }
    
    // Event listeners para botones de imágenes de prueba
    testImgBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            loadTestImage(category);
        });
    });
    
    // Probar automáticamente cuando se pegue una URL
    newsImageInput.addEventListener('paste', function(e) {
        setTimeout(() => {
            if (this.value.trim() && this.value.trim().startsWith('http')) {
                testImageUrl();
            }
        }, 100);
    });
}

// ===== FUNCIONALIDAD PARA SUBCATEGORÍAS =====

// Inicializar selector de subcategorías
function initSubcategorySelector() {
    const categorySelect = document.getElementById('news-category');
    if (categorySelect && !categorySelect.dataset.subcatListenerAdded) {
        categorySelect.dataset.subcatListenerAdded = 'true';
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            populateSubcategorySelect(selectedCategory);
            updateSubcategoryHint(selectedCategory);
        });
    }
}

// ===== AUTENTICACIÓN =====
auth.onAuthStateChanged(user => {
    if (user) {
        // MOSTRAR UI DE ADMINISTRADOR
        showAdminUI(user);
        loadAdminNews();
        initCKEditor();
        initSummaryCounter();
        initImageFunctionality();
        initSubcategorySelector();
    } else {
        showLoginUI();
    }
});

// Función para configurar event listeners
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
                // Limpiar también la vista previa de imagen y subcategorías
                imagePreviewContainer.classList.add('hidden');
                document.getElementById('news-subcategory').innerHTML = '<option value="">Selecciona una subcategoría (opcional)</option>';
                document.getElementById('news-subcategory').disabled = true;
                document.getElementById('subcategory-label-hint').textContent = '';
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
    
    // Botones de cambio de vista
    if (viewCategoriesBtn && !viewCategoriesBtn.dataset.listenerAdded) {
        viewCategoriesBtn.dataset.listenerAdded = 'true';
        viewCategoriesBtn.addEventListener('click', () => {
            switchViewMode('categories');
        });
    }
    
    if (viewListBtn && !viewListBtn.dataset.listenerAdded) {
        viewListBtn.dataset.listenerAdded = 'true';
        viewListBtn.addEventListener('click', () => {
            switchViewMode('list');
        });
    }
    
    // Botón para volver a categorías desde vista detalle
    if (backToCategoriesAdminBtn && !backToCategoriesAdminBtn.dataset.listenerAdded) {
        backToCategoriesAdminBtn.dataset.listenerAdded = 'true';
        backToCategoriesAdminBtn.addEventListener('click', showAdminCategoriesView);
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
    
    // Búsqueda en categoría específica
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
                loadAdminCategoryNews(currentAdminCategory, searchTerm);
            }, 500);
        });
        
        // Permitir búsqueda con Enter
        categorySearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(categorySearchDebounceTimer);
                const searchTerm = this.value.trim();
                currentCategorySearch = searchTerm;
                loadAdminCategoryNews(currentAdminCategory, searchTerm);
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
            loadAdminCategoryNews(currentAdminCategory);
        });
    }
}

// Cambiar modo de vista
function switchViewMode(mode) {
    currentViewMode = mode;
    
    // Actualizar botones activos
    viewCategoriesBtn.classList.toggle('active', mode === 'categories');
    viewListBtn.classList.toggle('active', mode === 'list');
    
    // Mostrar/ocultar contenedores
    if (mode === 'categories') {
        adminCategoriesContainer.classList.remove('hidden');
        adminNewsContainer.classList.add('hidden');
        adminCategoryDetail.classList.add('hidden');
        loadAdminCategories();
    } else {
        adminCategoriesContainer.classList.add('hidden');
        adminNewsContainer.classList.remove('hidden');
        adminCategoryDetail.classList.add('hidden');
        loadAdminNewsList();
    }
}

// Mostrar vista de categorías en admin
function showAdminCategoriesView() {
    adminCategoriesContainer.classList.remove('hidden');
    adminCategoryDetail.classList.add('hidden');
    adminNewsContainer.classList.add('hidden');
    currentAdminCategory = '';
    currentCategorySearch = '';
    
    // Resetear búsqueda
    if (categorySearchInput) {
        categorySearchInput.value = '';
    }
    if (clearCategorySearchBtn) {
        clearCategorySearchBtn.style.display = 'none';
    }
    
    loadAdminCategories();
}

// Mostrar noticias de una categoría específica en admin
function showAdminCategoryDetail(category) {
    currentAdminCategory = category;
    currentCategorySearch = '';
    
    adminCategoriesContainer.classList.add('hidden');
    adminCategoryDetail.classList.remove('hidden');
    adminNewsContainer.classList.add('hidden');
    adminCategoryTitle.textContent = category;
    
    // Resetear búsqueda
    if (categorySearchInput) {
        categorySearchInput.value = '';
    }
    if (clearCategorySearchBtn) {
        clearCategorySearchBtn.style.display = 'none';
    }
    
    loadAdminCategoryNews(category);
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

// Cargar noticias para el administrador
function loadAdminNews(searchTerm = '', category = '') {
    if (isAdminLoading) {
        console.log('Carga de admin en progreso, ignorando...');
        return;
    }
    
    const loadId = ++currentAdminLoadId;
    console.log(`Iniciando carga admin #${loadId}`, { searchTerm, category });
    
    isAdminLoading = true;
    
    // Limpiar contenedores según la vista actual
    if (currentViewMode === 'categories') {
        adminCategoriesContainer.innerHTML = '';
    } else {
        adminNewsContainer.innerHTML = '';
    }
    
    adminNewsLoading.classList.remove('hidden');
    
    db.collection('news').get()
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
            const newsByCategory = {};
            const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
            const seenIds = new Set(); // Para evitar duplicados
            
            if (querySnapshot.empty) {
                if (currentViewMode === 'categories') {
                    adminCategoriesContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No hay noticias publicadas.</p>';
                } else {
                    adminNewsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No hay noticias publicadas.</p>';
                }
                newsCount.textContent = '(0)';
                isAdminLoading = false;
                return;
            }
            
            querySnapshot.forEach(doc => {
                const news = doc.data();
                news.id = doc.id;
                
                // Evitar duplicados por ID
                if (seenIds.has(news.id)) {
                    console.warn('Noticia duplicada en admin:', news.id);
                    return;
                }
                seenIds.add(news.id);
                
                // Filtrar por categoría
                if (category && category !== '') {
                    if (!news.category || news.category.trim() !== category.trim()) {
                        return;
                    }
                }
                
                // Filtrar por búsqueda
                if (searchTerm) {
                    const titleMatch = news.title ? news.title.toLowerCase().includes(searchLower) : false;
                    const summaryMatch = news.summary ? news.summary.toLowerCase().includes(searchLower) : false;
                    const tagsMatch = news.tags ? news.tags.toLowerCase().includes(searchLower) : false;
                    
                    if (!titleMatch && !summaryMatch && !tagsMatch) {
                        return;
                    }
                }
                
                filteredCount++;
                const cat = news.category || 'General';
                
                if (!newsByCategory[cat]) {
                    newsByCategory[cat] = [];
                }
                newsByCategory[cat].push(news);
            });
            
            // Ordenar noticias dentro de cada categoría por fecha
            Object.keys(newsByCategory).forEach(cat => {
                newsByCategory[cat].sort((a, b) => {
                    const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
                    const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
                    return dateB - dateA;
                });
            });
            
            // Actualizar contador
            let countText = `(${filteredCount}`;
            if (filteredCount !== totalCount) {
                countText += ` de ${totalCount}`;
            }
            countText += ')';
            newsCount.textContent = countText;
            
            // Mostrar según el modo de vista
            if (currentViewMode === 'categories') {
                displayAdminCategories(newsByCategory, searchTerm);
            } else {
                displayAdminNewsList(newsByCategory, searchTerm);
            }
            
            console.log(`Carga admin #${loadId} completada: ${filteredCount} de ${totalCount}`);
            isAdminLoading = false;
        })
        .catch(error => {
            if (loadId === currentAdminLoadId) {
                adminNewsLoading.classList.add('hidden');
                console.error('Error al cargar noticias:', error);
                showMessage('Error al cargar las noticias', 'error');
            }
            isAdminLoading = false;
        });
}

// Cargar categorías para vista de admin
function loadAdminCategories() {
    loadAdminNews(searchNewsInput.value, adminCategoryFilter ? adminCategoryFilter.value : '');
}

// Cargar lista de noticias para vista de admin
function loadAdminNewsList() {
    loadAdminNews(searchNewsInput.value, adminCategoryFilter ? adminCategoryFilter.value : '');
}

// Cargar noticias de una categoría específica en admin
function loadAdminCategoryNews(category, searchTerm = '') {
    if (isAdminLoading) {
        console.log('Carga de admin en progreso, ignorando...');
        return;
    }
    
    const loadId = ++currentAdminLoadId;
    console.log(`Iniciando carga categoría admin #${loadId} para: "${category}" con búsqueda: "${searchTerm}"`);
    
    isAdminLoading = true;
    adminCategoryNewsContainer.innerHTML = '';
    adminNewsLoading.classList.remove('hidden');
    
    db.collection('news').get()
        .then(querySnapshot => {
            // Verificar si es la carga más reciente
            if (loadId !== currentAdminLoadId) {
                console.log(`Carga categoría admin #${loadId} obsoleta`);
                isAdminLoading = false;
                return;
            }
            
            adminNewsLoading.classList.add('hidden');
            
            if (querySnapshot.empty) {
                adminCategoryNewsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No hay noticias en esta categoría.</p>';
                isAdminLoading = false;
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
                    console.warn('Noticia duplicada en admin categoría:', news.id);
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
            
            // Ordenar por fecha
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
                
                adminCategoryNewsContainer.innerHTML = `
                    <div class="category-no-results">
                        <i class="fas fa-search"></i>
                        <h4>${message}</h4>
                        ${searchTerm ? 
                            `<button id="clear-current-category-search" class="back-to-all-category">
                                <i class="fas fa-times"></i> Mostrar todas las noticias de ${category}
                            </button>` 
                            : ''
                        }
                    </div>
                `;
                
                // Agregar event listener al botón de limpiar búsqueda si existe
                const clearBtn = document.getElementById('clear-current-category-search');
                if (clearBtn && !clearBtn.dataset.listenerAdded) {
                    clearBtn.dataset.listenerAdded = 'true';
                    clearBtn.addEventListener('click', () => {
                        categorySearchInput.value = '';
                        currentCategorySearch = '';
                        clearCategorySearchBtn.style.display = 'none';
                        loadAdminCategoryNews(category);
                    });
                }
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
                    adminCategoryNewsContainer.appendChild(resultsInfo);
                }
                
                const seenCardIds = new Set(); // Para evitar tarjetas duplicadas
                newsList.forEach(news => {
                    if (!seenCardIds.has(news.id)) {
                        seenCardIds.add(news.id);
                        const newsCard = createAdminNewsCard(news);
                        adminCategoryNewsContainer.appendChild(newsCard);
                    }
                });
            }
            
            console.log(`Carga categoría admin #${loadId} completada: ${newsList.length} noticias`);
            isAdminLoading = false;
        })
        .catch(error => {
            if (loadId === currentAdminLoadId) {
                adminNewsLoading.classList.add('hidden');
                console.error('Error al cargar noticias de categoría:', error);
                showMessage('Error al cargar las noticias', 'error');
            }
            isAdminLoading = false;
        });
}

// Mostrar categorías en admin
function displayAdminCategories(newsByCategory, searchTerm = '') {
    adminCategoriesContainer.innerHTML = '';
    
    if (Object.keys(newsByCategory).length === 0) {
        let message = 'No se encontraron noticias';
        if (adminCategoryFilter.value) message += ` en la categoría "${adminCategoryFilter.value}"`;
        if (searchTerm) message += ` con el término "${searchTerm}"`;
        
        adminCategoriesContainer.innerHTML = `
            <div class="no-results-message">
                <i class="fas fa-search"></i>
                <h3>${message}</h3>
                <button id="clear-all-filters-admin" class="back-button">
                    <i class="fas fa-times"></i> Limpiar filtros
                </button>
            </div>
        `;
        
        const clearBtn = document.getElementById('clear-all-filters-admin');
        if (clearBtn && !clearBtn.dataset.listenerAdded) {
            clearBtn.dataset.listenerAdded = 'true';
            clearBtn.addEventListener('click', () => {
                searchNewsInput.value = '';
                if (adminCategoryFilter) adminCategoryFilter.value = '';
                loadAdminNews();
            });
        }
        return;
    }
    
    // Crear tarjetas de categorías
    Object.keys(newsByCategory).forEach(categoryName => {
        const categoryNews = newsByCategory[categoryName];
        const categoryCard = createAdminCategoryCard(categoryName, categoryNews);
        adminCategoriesContainer.appendChild(categoryCard);
    });
}

// Mostrar lista de noticias en admin
function displayAdminNewsList(newsByCategory, searchTerm = '') {
    adminNewsContainer.innerHTML = '';
    
    // Combinar todas las noticias en una lista
    const allNews = [];
    Object.keys(newsByCategory).forEach(category => {
        allNews.push(...newsByCategory[category]);
    });
    
    // Ordenar por fecha (más reciente primero)
    allNews.sort((a, b) => {
        const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
        const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
        return dateB - dateA;
    });
    
    if (allNews.length === 0) {
        let message = 'No se encontraron noticias';
        if (adminCategoryFilter.value) message += ` en la categoría "${adminCategoryFilter.value}"`;
        if (searchTerm) message += ` con el término "${searchTerm}"`;
        
        adminNewsContainer.innerHTML = `
            <div class="no-results-message">
                <i class="fas fa-search"></i>
                <h3>${message}</h3>
                <button id="clear-all-filters-list" class="back-button">
                    <i class="fas fa-times"></i> Limpiar filtros
                </button>
            </div>
        `;
        
        const clearBtn = document.getElementById('clear-all-filters-list');
        if (clearBtn && !clearBtn.dataset.listenerAdded) {
            clearBtn.dataset.listenerAdded = 'true';
            clearBtn.addEventListener('click', () => {
                searchNewsInput.value = '';
                if (adminCategoryFilter) adminCategoryFilter.value = '';
                loadAdminNews();
            });
        }
        return;
    }
    
    // Mostrar todas las noticias en grid (evitar duplicados por ID)
    const seenCardIds = new Set();
    allNews.forEach(news => {
        if (!seenCardIds.has(news.id)) {
            seenCardIds.add(news.id);
            const newsCard = createAdminNewsCard(news);
            adminNewsContainer.appendChild(newsCard);
        }
    });
}

// Crear tarjeta de categoría para admin
function createAdminCategoryCard(categoryName, newsList) {
    const card = document.createElement('div');
    card.className = 'category-card';
    const categoryColor = categoryColors[categoryName] || '#4a6fc1';
    const categoryIcon = categoryIcons[categoryName] || 'fa-folder';
    
    // Agrupar por subcategoría para mostrar variedad
    const subcategoriesMap = {};
    newsList.forEach(news => {
        const sub = news.subcategory || 'General';
        if (!subcategoriesMap[sub]) {
            subcategoriesMap[sub] = [];
        }
        subcategoriesMap[sub].push(news);
    });
    
    // Obtener lista de noticias para mostrar (priorizando diferentes subcategorías)
    const displayNews = [];
    const subcategories = Object.keys(subcategoriesMap);
    
    // Mostrar hasta 3 noticias de diferentes subcategorías si es posible
    if (subcategories.length >= 3) {
        for (let i = 0; i < 3; i++) {
            if (subcategoriesMap[subcategories[i]] && subcategoriesMap[subcategories[i]].length > 0) {
                displayNews.push(subcategoriesMap[subcategories[i]][0]);
            }
        }
    } else {
        newsList.slice(0, 3).forEach(news => {
            if (!displayNews.some(n => n.id === news.id)) {
                displayNews.push(news);
            }
        });
    }
    
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
                ${displayNews.map(news => {
                    const subcatDisplay = news.subcategory ? `<span class="news-subcategory-badge">${news.subcategory}</span>` : '';
                    return `
                    <div class="category-news-item-admin" data-id="${news.id}">
                        <div class="category-news-image" style="background-image: url('${news.imageUrl || DEFAULT_IMAGE}')"></div>
                        <div class="category-news-content">
                            <h4 class="category-news-title">${news.title}</h4>
                            ${subcatDisplay}
                            <div class="category-news-date">
                                <i class="far fa-calendar-alt"></i>
                                ${formatShortDate(news.timestamp)}
                            </div>
                            <div class="category-news-actions">
                                <button class="edit-news-admin" data-id="${news.id}">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="delete-news-admin" data-id="${news.id}">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
            
            <!-- Mostrar subcategorías disponibles -->
            ${Object.keys(subcategoriesMap).length > 1 ? `
                <div class="subcategories-mini-list">
                    <span class="subcategories-label">Subcategorías:</span>
                    ${Object.keys(subcategoriesMap).slice(0, 5).map(sub => 
                        `<button class="subcategory-mini-btn" data-category="${categoryName}" data-subcategory="${sub}">${sub}</button>`
                    ).join('')}
                    ${Object.keys(subcategoriesMap).length > 5 ? '<span class="more-subcats">+ más</span>' : ''}
                </div>
            ` : ''}
        </div>
        <div class="category-card-footer">
            <button class="view-category-btn-admin" data-category="${categoryName}">
                Ver todas las noticias de ${categoryName}
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Agregar event listeners para ver categoría
    const viewBtn = card.querySelector('.view-category-btn-admin');
    if (viewBtn && !viewBtn.dataset.listenerAdded) {
        viewBtn.dataset.listenerAdded = 'true';
        viewBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const category = this.getAttribute('data-category');
            showAdminCategoryDetail(category);
        });
    }
    
    // Agregar listeners para subcategorías
    const subcatBtns = card.querySelectorAll('.subcategory-mini-btn');
    subcatBtns.forEach(btn => {
        if (!btn.dataset.listenerAdded) {
            btn.dataset.listenerAdded = 'true';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const category = this.getAttribute('data-category');
                const subcategory = this.getAttribute('data-subcategory');
                // Filtrar por subcategoría - implementar según necesidad
                console.log(`Filtrar por subcategoría: ${category} > ${subcategory}`);
                showMessage(`Filtro por subcategoría: ${subcategory}`, 'info');
            });
        }
    });
    
    // Agregar listeners a los botones de editar/eliminar
    const editBtns = card.querySelectorAll('.edit-news-admin');
    editBtns.forEach(btn => {
        if (!btn.dataset.listenerAdded) {
            btn.dataset.listenerAdded = 'true';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const newsId = this.getAttribute('data-id');
                editNews(newsId);
            });
        }
    });
    
    const deleteBtns = card.querySelectorAll('.delete-news-admin');
    deleteBtns.forEach(btn => {
        if (!btn.dataset.listenerAdded) {
            btn.dataset.listenerAdded = 'true';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const newsId = this.getAttribute('data-id');
                deleteNews(newsId);
            });
        }
    });
    
    // Listener para la noticia completa
    const newsItems = card.querySelectorAll('.category-news-item-admin');
    newsItems.forEach(item => {
        if (!item.dataset.listenerAdded) {
            item.dataset.listenerAdded = 'true';
            item.addEventListener('click', function() {
                const newsId = this.getAttribute('data-id');
                window.open(`index.html?news=${newsId}`, '_blank');
            });
        }
    });
    
    return card;
}

// Crear tarjeta de noticia para admin (lista o categoría)
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
                ${news.subcategory ? `<span class="news-subcategory-badge">${news.subcategory}</span>` : ''}
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
    
    // Agregar event listeners
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
                
                // Cargar subcategoría
                if (news.category) {
                    populateSubcategorySelect(news.category, news.subcategory || '');
                    updateSubcategoryHint(news.category);
                }
                
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
                
                // Mostrar vista previa si hay imagen
                if (news.imageUrl) {
                    newsImageInput.value = news.imageUrl;
                    testImageUrl();
                } else {
                    imagePreviewContainer.classList.add('hidden');
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
        subcategory: document.getElementById('news-subcategory').value,
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
    
    // Restaurar subcategoría
    if (currentDraft.category) {
        populateSubcategorySelect(currentDraft.category, currentDraft.subcategory || '');
        updateSubcategoryHint(currentDraft.category);
    }
    
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
    
    // Mostrar vista previa si hay imagen
    if (currentDraft.imageUrl) {
        newsImageInput.value = currentDraft.imageUrl;
        testImageUrl();
    }
    
    showMessage('Borrador restaurado', 'success');
}

// Publicar nueva noticia
function publishNews(event) {
    event.preventDefault();
    
    const title = document.getElementById('news-title').value.trim();
    const category = document.getElementById('news-category').value;
    const subcategory = document.getElementById('news-subcategory').value;
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
        subcategory: subcategory || '',
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
            
            // Limpiar vista previa de imagen y subcategorías
            imagePreviewContainer.classList.add('hidden');
            document.getElementById('news-subcategory').innerHTML = '<option value="">Selecciona una subcategoría (opcional)</option>';
            document.getElementById('news-subcategory').disabled = true;
            
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
    const subcategory = document.getElementById('news-subcategory').value;
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
                    ${subcategory ? `<span class="news-detail-subcategory">› ${subcategory}</span>` : ''}
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

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar event listeners
    setupEventListeners();
    
    // Cargar borrador si existe
    loadDraft();
    
    // Configurar año actual en el footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});