/**
 * FormSection 컴포넌트
 * 폼 섹션 생성 및 관리
 */

class FormSection {
    constructor() {
        this.sections = new Map();
    }

    create(config) {
        const sectionId = this.generateId();
        const sectionElement = this.createSectionElement(sectionId, config);
        
        this.sections.set(sectionId, { element: sectionElement, config, fields: [] });
        this.addEventListeners(sectionElement, sectionId, config);
        
        return sectionElement;
    }

    createSectionElement(id, config) {
        const section = document.createElement('div');
        section.className = 'form-section';
        section.setAttribute('data-section-id', id);

        if (config.collapsed) {
            section.classList.add('collapsed');
        }

        section.innerHTML = `
            <div class="form-section-header">
                <h3 class="form-section-title">${config.title}</h3>
                <span class="form-section-toggle">▼</span>
            </div>
            <div class="form-section-content">
                ${config.description ? `<p class="form-section-description">${config.description}</p>` : ''}
            </div>
        `;

        return section;
    }

    addEventListeners(sectionElement, sectionId, config) {
        const header = sectionElement.querySelector('.form-section-header');
        
        if (config.collapsible !== false) {
            header.addEventListener('click', () => {
                this.toggleSection(sectionId);
            });
        }
    }

    toggleSection(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData) return;

        const { element } = sectionData;
        element.classList.toggle('collapsed');
    }

    addField(sectionId, fieldConfig) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData) return null;

        const fieldElement = window.FormField.create(fieldConfig);
        const content = sectionData.element.querySelector('.form-section-content');
        content.appendChild(fieldElement);
        
        sectionData.fields.push(fieldElement);
        return fieldElement;
    }

    generateId() {
        return 'section_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

window.FormSection = new FormSection(); 