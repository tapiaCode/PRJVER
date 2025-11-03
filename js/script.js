        document.addEventListener('DOMContentLoaded', function () {
            const mainTabs = document.querySelectorAll('.tab-button');
            const mainContentSections = document.querySelectorAll('.content-section');

            mainTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.getAttribute('data-target');

                    // Ocultar todas las secciones principales
                    mainContentSections.forEach(section => {
                        section.classList.add('hidden');
                    });

                    // Quitar clase 'active' de todas las pestañas principales
                    mainTabs.forEach(t => {
                        t.classList.remove('active');
                        t.classList.add('bg-white', 'bg-opacity-50', 'hover:bg-opacity-100');
                    });

                    // Mostrar la sección objetivo
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        targetSection.classList.remove('hidden');
                    }

                    // Marcar la pestaña principal como activa
                    tab.classList.add('active');
                    tab.classList.remove('bg-white', 'bg-opacity-50', 'hover:bg-opacity-100');
                });
            });

            // Lógica para las sub-pestañas (Frutas/Hortalizas)
            const subTabs = document.querySelectorAll('.sub-tab-button');
            const subContentSections = document.querySelectorAll('.sub-content-section');

            subTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.getAttribute('data-target');

                    // Ocultar todas las sub-secciones
                    subContentSections.forEach(section => {
                        section.classList.add('hidden');
                    });

                    // Quitar clase 'active' de todas las sub-pestañas
                    subTabs.forEach(t => {
                        t.classList.remove('active', 'shadow');
                        t.classList.add('bg-white', 'bg-opacity-50');
                    });

                    // Mostrar la sub-sección objetivo
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        targetSection.classList.remove('hidden');
                    }

                    // Marcar la sub-pestaña como activa
                    tab.classList.add('active', 'shadow');
                    tab.classList.remove('bg-white', 'bg-opacity-50');
                });
            });
        });
