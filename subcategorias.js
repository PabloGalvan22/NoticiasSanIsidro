// subcategorias.js - Definición de subcategorías por categoría principal

const SUBCATEGORIES = {
    'Tecnología': [
        'Innovación',
        'Ciberseguridad',
        'Inteligencia Artificial',
        'Redes Sociales',
        'Aplicaciones',
        'Internet',
        'Tecnología Educativa',
        'Peligros Digitales',
        'Videojuegos'
    ],
    'Salud': [
        'Salud Pública',
        'Vacunación',
        'Enfermedades',
        'Salud Mental',
        'Nutrición',
        'Medicamentos',
        'Tratamientos',
        'Prevención',

    ],
    'Internacional': [
        'América Latina',
        'Estados Unidos',
        'Europa',
        'Asia',
        'África',
        'Conflictos Internacionales',
        'Economía Global',
        'Cambio Climático',
        'Migración',
        'Derechos Humanos',
        'Guerras',
        'Tratados Internacionales'
        
    ],
    'Educación': [
        'SEP',
        'Becas Académicas',
        'Educación en Línea',
        'Universidades Públicas',
        'Universidades Privadas',
        'Investigación Educativa',
        'Infraestructura Escolar'
    ],
    'Ciencia': [
        'Investigación',
        'Descubrimientos',
        'Medio Ambiente',
        'Biotecnología',
        'Física',
        'Química',
        'Astronomía',
        'Cambio Climático',
        'Científicos Mexicanos',
        'Tecnología Espacial'
    ],
    'Ayudas': [
        'Programas Sociales',
        'Apoyos Económicos',
        'Adultos Mayores',
        'Personas con Discapacidad',
        'Madres Solteras',
        'Jóvenes',
        'Campesinos',
        'Apoyos Alimentarios',
        'Vivienda',
        'Desastres Naturales',
        'Jóvenes Construyendo el Futuro',
    ],
    'Comunitaria': [
        'Eventos Locales',
        'Juntas Vecinales',
        'Obras Comunitarias',
        'Seguridad Vecinal',
        'Cooperativas',
        'Organizaciones Civiles',
        'Voluntariado',
        'Proyectos Comunitarios',
        'Fiestas Patronales',
        'Ferias Locales',
        'Mercados',
        'Transporte Público',
        'Problemas Comunitarios'
    ],
    'Seguridad Publica': [
        'peligros en redes sociales',
        'Peligros en los videojuegos'
    ]
};

// Subcategorías por defecto para categorías no listadas
const DEFAULT_SUBCATEGORIES = [
    'General'
];

// Función para obtener subcategorías de una categoría
function getSubcategoriesForCategory(category) {
    return SUBCATEGORIES[category] || DEFAULT_SUBCATEGORIES;
}

// Función para llenar el selector de subcategorías
function populateSubcategorySelect(category, selectedSubcategory = '') {
    const select = document.getElementById('news-subcategory');
    if (!select) return;
    
    // Limpiar opciones actuales
    select.innerHTML = '<option value="">Selecciona una subcategoría (opcional)</option>';
    
    if (!category) {
        select.disabled = true;
        return;
    }
    
    const subcategories = getSubcategoriesForCategory(category);
    
    subcategories.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = sub;
        if (selectedSubcategory === sub) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    select.disabled = false;
}

// Función para mostrar sugerencia de subcategoría
function updateSubcategoryHint(category) {
    const hint = document.getElementById('subcategory-label-hint');
    if (!hint) return;
    
    if (category) {
        hint.textContent = `para ${category}`;
    } else {
        hint.textContent = '';
    }
}