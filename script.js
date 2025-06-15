document.addEventListener('DOMContentLoaded', function() {
    const loadJSONContent = async (elementId, filePath) => {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            renderJSONContent(elementId, data);
        } catch (error) {
            console.error('Error loading JSON file:', error);
            document.getElementById(elementId).innerHTML = 
                '<p>Failed to load content. Please try again later.</p>';
        }
    };

    const renderJSONContent = (elementId, data) => {
        const container = document.getElementById(elementId);
        
        let html = '';
        
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.type === 'publication') {
                    html += renderPublication(item);
                } else if (item.type === 'student-group') {
                    html += renderStudentGroup(item);
                } else if (item.type === 'course') {
                    html += renderCourse(item);
                } else if (item.type === 'service') {
                    html += renderService(item);
                } else {
                    html += renderGenericItem(item);
                }
            });
        } else if (typeof data === 'object') {
            html += renderResearchContent(data);
        }
        
        container.innerHTML = html;
    };

    const renderResearchContent = (data) => {
        let html = '';
        
        if (data.sections) {
            data.sections.forEach(section => {
                html += `<h2 data-en="${section.titleen}" data-zh="${section.titlezh}">${section.titleen}</h2>`;
                
                if (section.subsections) {
                    section.subsections.forEach(subsection => {
                        html += `<h3 data-en="${subsection.titleen}" data-zh="${subsection.titlezh}">${subsection.titleen}</h3>`;
                        html += `<p data-en="${subsection.contenten}" data-zh="${subsection.contentzh}">${subsection.contenten}</p>`;
                    });
                } 
                // else if (section.content) {
                //     if (Array.isArray(section.content)) {
                //         html += '<ul>';
                //         section.content.forEach(item => {
                //             html += `<li>${item}</li>`;
                //         });
                //         html += '</ul>';
                //     } else {
                //         html += `<p>${section.content}</p>`;
                //     }
                // }
            });
        }
        
        return html;
    };

    const renderPublication = (pub) => {
        let html = `<div class="publication-item">`;
        
        html += `<h3>${pub.title}</h3>`;
        
        let str = pub.authors;
        let bolded = str.replace("Kaiqi Zhao", "<strong>Kaiqi Zhao</strong>");

        html += `<p class="publication-authors">${bolded}</p>`;

        html += `<p class="publication-venue">${pub.venue}, ${pub.year}</p>`;
        
        if (pub.links) {
            html += `<span class="publication-links">`;
            Object.entries(pub.links).forEach(([type, url]) => {
                html += `<a href="${url}" target="_blank">[${type}]</a> `;
            });
            html += `</span>`;
        }
        
        html += `</div>`;
        return html;
    };

    const renderStudentGroup = (group) => {
        let html = `<h2>${group.title}</h2>`;
        
        group.students.forEach(student => {
            html += `<div class="student-item">`;
            html += `<h3>${student.name}${student.degree ? ` (${student.degree})` : ''}</h3>`;
            html += `<p><strong>${student.year}</strong></p>`;

            if (student.research) {
                html += `<p>Research topics: ${student.research}</p>`;
            }
            
            if (student.employment) {
                html += `<p>Employment: ${student.employment}</p>`;
            }
            
            html += `</div>`;
        });
        
        return html;
    };

    const renderCourse = (course) => {
        return `
            <div class="course-item">
                <h3>${course.name} (${course.code})</h3>
                <p>${course.corhort}</p>
                <p>${course.year}, {${course.university}}</p>
            </div>
        `;
    };

    const renderService = (service) => {
        return `
            <div class="service-item">
                <h3>${service.title}</h3>
                <p>${service.organization}
                ${service.period ? `&nbsp;&nbsp;(${service.period})</p>` : '</p>'}
            </div>
        `;
    };

    const renderGenericItem = (item) => {
        return `
            <div class="generic-item">
                <h3>${item.title || item.name}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
            </div>
        `;
    };

    const renderLinks = (links) => {
        let html = '';
        for (const [text, url] of Object.entries(links)) {
            html += `<a href="${url}" target="_blank">[${text}]</a> `;
        }
        return html;
    };

    loadJSONContent('research-content', 'data/research.json');
    loadJSONContent('publications-content', 'data/publications.json');
    loadJSONContent('team-content', 'data/team.json');
    loadJSONContent('teaching-content', 'data/teaching.json');
    loadJSONContent('services-content', 'data/services.json');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - document.querySelector('nav').offsetHeight,
                    behavior: 'smooth'
                });
                
                if (document.querySelector('.nav-links').classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    const toggleMobileMenu = () => {
        document.querySelector('.nav-links').classList.toggle('active');
        document.querySelector('.nav-toggle i').classList.toggle('fa-times');
        document.querySelector('.nav-toggle i').classList.toggle('fa-bars');
    };

    document.querySelector('.nav-toggle').addEventListener('click', toggleMobileMenu);

    const langToggle = document.getElementById('lang-toggle');
    let currentLang = 'en'; 
    
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        updateLanguage(currentLang);
    });

    const updateLanguage = (lang) => {
        document.querySelectorAll('.nav-links a').forEach(link => {
            const text = link.textContent;
            if (link.dataset[lang]) {
                link.textContent = link.dataset[lang];
            }
        });

        document.querySelectorAll('[data-en], [data-zh]').forEach(element => {
            if (element.dataset[lang]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = element.dataset[lang];
                } else {
                    element.textContent = element.dataset[lang];
                }
            }
        });

        langToggle.textContent = lang === 'zh' ? 'EN/中文' : '中文/EN';
    };

    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });

    updateLanguage(currentLang);
});