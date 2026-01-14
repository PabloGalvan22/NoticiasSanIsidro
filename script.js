// CONFIGURACIÓN DE ADMINISTRADOR
// Cambia esta contraseña por una que solo tú conozcas
const ADMIN_PASSWORD = "comunidad123";
const SESSION_KEY = "newsAdminLoggedIn";

// Datos iniciales de noticias
let newsData = [
    {
        id: 1,
        title: "Nuevas becas disponibles para estudiantes de secundaria",
        category: "becas",
        date: "15 de octubre, 2023",
        excerpt: "El gobierno local ha anunciado un nuevo programa de becas para estudiantes de secundaria con buenos promedios. Las inscripciones estarán abiertas hasta el 30 de noviembre.",
        content: "El gobierno local, en colaboración con el Ministerio de Educación, ha lanzado un programa de becas dirigido a estudiantes de secundaria con promedio superior a 8.5. Las becas cubrirán el 100% de los costos de materiales educativos y un estipendio mensual para gastos de transporte. Los interesados pueden registrarse en la página web del municipio o en la oficina de educación local.",
        image: "fas fa-graduation-cap"
    },
    {
        id: 2,
        title: "Ciberseguridad básica: Cómo proteger tu información personal",
        category: "ciberseguridad",
        date: "10 de octubre, 2023",
        excerpt: "Con el aumento del uso de internet en nuestra comunidad, es fundamental conocer los principios básicos de seguridad en línea.",
        content: "En la era digital, proteger nuestra información personal es más importante que nunca. Algunos consejos básicos incluyen: usar contraseñas fuertes y diferentes para cada cuenta, no compartir información personal en redes sociales, verificar la autenticidad de los sitios web antes de ingresar datos sensibles, y mantener actualizado el software de tus dispositivos. Además, es importante educar a niños y adultos mayores sobre estos riesgos.",
        image: "fas fa-shield-alt"
    },
    {
        id: 3,
        title: "Riesgos de los adolescentes en redes sociales",
        category: "riesgos",
        date: "5 de octubre, 2023",
        excerpt: "Expertos advierten sobre los principales peligros que enfrentan los adolescentes en plataformas como Facebook, Instagram y TikTok.",
        content: "Las redes sociales pueden ser un espacio de interacción positiva, pero también presentan riesgos para los adolescentes. Entre los principales peligros se encuentran: el acoso cibernético (cyberbullying), la exposición a contenido inapropiado, el contacto con extraños, la adicción a las redes y la afectación de la autoestima por comparación con otros. Es importante que los padres establezcan límites de tiempo, conozcan las plataformas que usan sus hijos y mantengan un diálogo abierto sobre el uso responsable de internet.",
        image: "fas fa-exclamation-triangle"
    },
    {
        id: 4,
        title: "Cómo realizar trámites de documentos en línea",
        category: "tramites",
        date: "1 de octubre, 2023",
        excerpt: "Guía paso a paso para realizar trámites comunes sin necesidad de desplazarse a la ciudad.",
        content: "Cada vez más trámites pueden realizarse en línea, lo que es especialmente útil para nuestra comunidad alejada de los centros urbanos. Algunos trámites que puedes realizar en línea: solicitud de actas de nacimiento y matrimonio, registro para votar, pago de impuestos locales, solicitud de permisos de construcción menores, y consulta de historial crediticio básico. Para la mayoría de estos trámites necesitarás: una dirección de correo electrónico, documentos de identificación escaneados y una cuenta bancaria para pagos en línea.",
        image: "fas fa-file-alt"
    }
];

// Elementos del DOM
const newsGrid = document.getElementById('newsGrid');
const sectionTitle = document.getElementById('sectionTitle');
const navLinks = document.querySelectorAll('nav a[data-category], .important-links a[data-category], .footer-links a[data-category]');
const loginBtns = document.querySelectorAll('#loginBtn, #loginBtnBanner');
const addNewsBtns = document.querySelectorAll('#addNewsBtn, #addNewsBtn2');
const loginModal = document.getElementById('loginModal');
const newsModal = document.getElementById('newsModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeNewsModal = document.getElementById('closeNewsModal');
const loginForm = document.getElementById('loginForm');
const newsForm = document.getElementById('newsForm');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const adminStatus = document.getElementById('adminStatus');
const addNewsSidebar = document.getElementById('addNewsSidebar');
const logoutBtn = document.getElementById('logoutBtn');
const adminPasswordInput = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const modalTitle = document.getElementById('modalTitle');
const modalSubmitBtn = document.getElementById('modalSubmitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Variables de estado
let currentCategory = 'all';
let nextNewsId = newsData.length + 1;
let isAdmin = false;
let isEditing = false;
let currentEditId = null;

// Verificar si ya hay una sesión activa
function checkAdminStatus() {
    const loggedIn = sessionStorage.getItem(SESSION_KEY);
    if (loggedIn === 'true') {
        isAdmin = true;
        showAdminInterface();
    }
}

// Mostrar interfaz de administrador
function showAdminInterface() {
    isAdmin = true;
    sessionStorage.setItem(SESSION_KEY, 'true');
    
    // Mostrar elementos de admin
    adminStatus.style.display = 'block';
    addNewsSidebar.style.display = 'block';
    document.getElementById('addNewsBtn').style.display = 'inline-block';
    
    // Cambiar texto de botones de login
    loginBtns.forEach(btn => {
        btn.innerHTML = '<i class="fas fa-user-cog"></i> Panel Admin';
    });
    
    // Renderizar noticias con botones de admin
    renderNews();
}

// Ocultar interfaz de administrador
function hideAdminInterface() {
    isAdmin = false;
    sessionStorage.removeItem(SESSION_KEY);
    
    // Ocultar elementos de admin
    adminStatus.style.display = 'none';
    addNewsSidebar.style.display = 'none';
    document.getElementById('addNewsBtn').style.display = 'none';
    
    // Restaurar texto de botones de login
    loginBtns.forEach(btn => {
        btn.innerHTML = '<i class="fas fa-user-shield"></i> Acceso Admin';
    });
    
    // Renderizar noticias sin botones de admin
    renderNews();
}

// Función para renderizar noticias
function renderNews() {
    newsGrid.innerHTML = '';
    
    // Filtrar noticias por categoría
    const filteredNews = currentCategory === 'all' 
        ? newsData 
        : newsData.filter(news => news.category === currentCategory);
    
    // Actualizar título de sección
    const categoryNames = {
        'all': 'Todas las noticias',
        'becas': 'Becas',
        'ciberseguridad': 'Ciberseguridad',
        'riesgos': 'Riesgos en Internet',
        'tramites': 'Trámites en línea',
        'otros': 'Otras noticias'
    };
    
    sectionTitle.textContent = categoryNames[currentCategory] || 'Noticias';
    
    // Si no hay noticias
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = `
            <div class="no-news" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-newspaper" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                <h3 style="color: var(--dark); margin-bottom: 10px;">No hay noticias en esta categoría</h3>
                <p style="color: var(--gray);">Sé el primero en compartir noticias sobre ${categoryNames[currentCategory] || 'este tema'}.</p>
                ${isAdmin ? '<button class="btn" id="addNewsFromEmpty" style="margin-top: 20px;">Agregar Noticia</button>' : ''}
            </div>
        `;
        
        document.getElementById('addNewsFromEmpty')?.addEventListener('click', () => {
            openAddNewsModal();
        });
        
        return;
    }
    
    // Crear tarjetas de noticias
    filteredNews.forEach(news => {
        const newsCard = document.createElement('article');
        newsCard.className = 'news-card';
        
        const categoryNames = {
            'becas': 'Becas',
            'ciberseguridad': 'Ciberseguridad',
            'riesgos': 'Riesgos en Internet',
            'tramites': 'Trámites en línea',
            'otros': 'Otros'
        };
        
        // Determinar si es una URL o un icono de FontAwesome
        let imageContent = '';
        if (news.image.startsWith('http') || news.image.startsWith('https')) {
            imageContent = `<img src="${news.image}" alt="${news.title}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            imageContent = `<i class="${news.image}"></i>`;
        }
        
        newsCard.innerHTML = `
            <div class="news-img">
                ${imageContent}
            </div>
            <div class="news-content">
                <span class="news-category">${categoryNames[news.category] || 'General'}</span>
                <h3 class="news-title">${news.title}</h3>
                <div class="news-date">${news.date}</div>
                <p class="news-excerpt">${news.excerpt}</p>
                <a href="#" class="read-more" data-id="${news.id}">Leer más <i class="fas fa-arrow-right"></i></a>
                
                ${isAdmin ? `
                <div class="admin-actions">
                    <button class="btn-edit" data-id="${news.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" data-id="${news.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        
        newsGrid.appendChild(newsCard);
    });
    
    // Agregar event listeners a los botones "Leer más"
    document.querySelectorAll('.read-more').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const newsId = parseInt(this.getAttribute('data-id'));
            showNewsDetail(newsId);
        });
    });
    
    // Agregar event listeners a los botones de administración
    if (isAdmin) {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const newsId = parseInt(this.getAttribute('data-id'));
                openEditNewsModal(newsId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const newsId = parseInt(this.getAttribute('data-id'));
                deleteNews(newsId);
            });
        });
    }
}

// Función para mostrar detalles de una noticia
function showNewsDetail(id) {
    const news = newsData.find(item => item.id === id);
    if (!news) return;
    
    // Crear modal para mostrar la noticia completa
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>${news.title}</h2>
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <span class="news-category">${news.category === 'becas' ? 'Becas' : 
                    news.category === 'ciberseguridad' ? 'Ciberseguridad' : 
                    news.category === 'riesgos' ? 'Riesgos en Internet' : 
                    news.category === 'tramites' ? 'Trámites en línea' : 'Otros'}</span>
                <div class="news-date" style="margin-left: 15px;">${news.date}</div>
            </div>
            <div style="margin-bottom: 30px; line-height: 1.8;">
                ${news.content.split('\n').map(paragraph => `<p style="margin-bottom: 15px;">${paragraph}</p>`).join('')}
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button class="btn close-detail-btn">Cerrar</button>
                ${isAdmin ? `
                <button class="btn btn-edit edit-detail-btn" data-id="${news.id}" style="margin-left: 10px;">
                    <i class="fas fa-edit"></i> Editar Noticia
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Event listeners para cerrar el modal
    const closeBtn = modal.querySelector('.close-modal');
    const closeDetailBtn = modal.querySelector('.close-detail-btn');
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    closeDetailBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Botón de editar en el modal de detalles
    const editDetailBtn = modal.querySelector('.edit-detail-btn');
    if (editDetailBtn) {
        editDetailBtn.addEventListener('click', () => {
            const newsId = parseInt(editDetailBtn.getAttribute('data-id'));
            document.body.removeChild(modal);
            openEditNewsModal(newsId);
        });
    }
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Función para cambiar categoría
function changeCategory(category) {
    currentCategory = category;
    
    // Actualizar enlaces activos
    navLinks.forEach(link => {
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        } else if (!link.classList.contains('admin-link')) {
            link.classList.remove('active');
        }
    });
    
    renderNews();
}

// Función para abrir modal de agregar noticia
function openAddNewsModal() {
    isEditing = false;
    currentEditId = null;
    modalTitle.textContent = 'Agregar nueva noticia';
    modalSubmitBtn.textContent = 'Publicar Noticia';
    cancelEditBtn.style.display = 'none';
    
    // Resetear formulario
    newsForm.reset();
    document.getElementById('newsId').value = '';
    
    newsModal.style.display = 'flex';
}

// Función para abrir modal de editar noticia
function openEditNewsModal(id) {
    const news = newsData.find(item => item.id === id);
    if (!news) return;
    
    isEditing = true;
    currentEditId = id;
    modalTitle.textContent = 'Editar noticia';
    modalSubmitBtn.textContent = 'Actualizar Noticia';
    cancelEditBtn.style.display = 'inline-block';
    
    // Rellenar formulario con datos de la noticia
    document.getElementById('newsId').value = news.id;
    document.getElementById('newsTitle').value = news.title;
    document.getElementById('newsCategory').value = news.category;
    document.getElementById('newsContent').value = news.content;
    document.getElementById('newsImage').value = news.image;
    document.getElementById('newsExcerpt').value = news.excerpt;
    
    newsModal.style.display = 'flex';
}

// Función para guardar noticia (agregar o editar)
function saveNews(news) {
    if (isEditing && currentEditId) {
        // Editar noticia existente
        const index = newsData.findIndex(item => item.id === currentEditId);
        if (index !== -1) {
            news.id = currentEditId;
            news.date = newsData[index].date; // Mantener la fecha original
            newsData[index] = news;
        }
    } else {
        // Agregar nueva noticia
        news.id = nextNewsId++;
        news.date = new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Generar excerpt si no se proporciona
        if (!news.excerpt || news.excerpt.trim() === '') {
            news.excerpt = news.content.length > 100 ? 
                news.content.substring(0, 100) + '...' : 
                news.content;
        }
        
        // Asignar icono según categoría si no se proporciona imagen
        if (!news.image || news.image.trim() === '') {
            const categoryIcons = {
                'becas': 'fas fa-graduation-cap',
                'ciberseguridad': 'fas fa-shield-alt',
                'riesgos': 'fas fa-exclamation-triangle',
                'tramites': 'fas fa-file-alt',
                'otros': 'fas fa-newspaper'
            };
            news.image = categoryIcons[news.category] || 'fas fa-newspaper';
        }
        
        newsData.unshift(news); // Agregar al principio
    }
    
    changeCategory(news.category); // Cambiar a la categoría de la noticia
}

// Función para eliminar noticia
function deleteNews(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer.')) {
        return;
    }
    
    const index = newsData.findIndex(item => item.id === id);
    if (index !== -1) {
        newsData.splice(index, 1);
        renderNews();
        
        // Mostrar mensaje de confirmación
        alert('Noticia eliminada exitosamente.');
    }
}

// Event Listeners
// Cambiar categoría al hacer clic en enlaces
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const category = this.getAttribute('data-category');
        if (category) {
            changeCategory(category);
            
            // Cerrar menú móvil si está abierto
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
});

// Abrir modal de login
loginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (isAdmin) {
            // Si ya está logueado, mostrar panel de admin (podrías añadir más funciones aquí)
            openAddNewsModal();
        } else {
            // Mostrar modal de login
            loginModal.style.display = 'flex';
            adminPasswordInput.focus();
        }
    });
});

// Cerrar modal de login
closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
    loginError.style.display = 'none';
});

// Cerrar modal de noticias
closeNewsModal.addEventListener('click', () => {
    newsModal.style.display = 'none';
});

// Cancelar edición
cancelEditBtn.addEventListener('click', () => {
    newsModal.style.display = 'none';
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        loginError.style.display = 'none';
    }
    if (e.target === newsModal) {
        newsModal.style.display = 'none';
    }
});

// Enviar formulario de login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = adminPasswordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        // Contraseña correcta
        loginError.style.display = 'none';
        loginModal.style.display = 'none';
        adminPasswordInput.value = '';
        
        showAdminInterface();
        
        // Mostrar mensaje de bienvenida
        alert('¡Bienvenido al panel de administración! Ahora puedes gestionar las noticias.');
    } else {
        // Contraseña incorrecta
        loginError.style.display = 'block';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
});

// Enviar formulario de noticias
newsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('newsTitle').value;
    const category = document.getElementById('newsCategory').value;
    const content = document.getElementById('newsContent').value;
    const image = document.getElementById('newsImage').value;
    const excerpt = document.getElementById('newsExcerpt').value;
    
    // Guardar la noticia
    saveNews({
        title,
        category,
        excerpt,
        content,
        image
    });
    
    // Cerrar modal y resetear formulario
    newsModal.style.display = 'none';
    
    // Mostrar mensaje de confirmación
    alert(isEditing ? '¡Noticia actualizada exitosamente!' : '¡Noticia publicada exitosamente!');
});

// Botón de agregar noticia
addNewsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        openAddNewsModal();
    });
});

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres cerrar la sesión de administrador?')) {
        hideAdminInterface();
        alert('Sesión de administrador cerrada.');
    }
});

// Menú móvil
mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Cerrar menú móvil al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navMenu.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    checkAdminStatus();
    renderNews();
});