# 투자문서 생성기 기술 문서

## 🔧 기술 상세 사양

### 21개 변수 정의 및 매핑

#### 1. 회사 기본 정보 (5개)
```json
{
  "company_info": {
    "투자대상": {
      "type": "text",
      "required": true,
      "maxLength": 50,
      "validation": "^[가-힣a-zA-Z0-9\\s\\(\\)\\-_]+$",
      "placeholder": "투자대상 회사명을 입력하세요",
      "templateMapping": ["[투자대상]", "[회사명]"]
    },
    "대표자": {
      "type": "text", 
      "required": true,
      "maxLength": 30,
      "validation": "^[가-힣a-zA-Z\\s]+$",
      "placeholder": "대표자 성명을 입력하세요",
      "templateMapping": ["[대표자]", "[대표자명]"]
    },
    "주소": {
      "type": "textarea",
      "required": true,
      "maxLength": 200,
      "placeholder": "회사 주소를 입력하세요",
      "templateMapping": ["[주소]", "[회사주소]"]
    },
    "Series": {
      "type": "select",
      "required": true,
      "options": ["Series A", "Series B", "Series C", "Pre-A", "Seed"],
      "templateMapping": ["[Series]", "[투자라운드]"]
    },
    "사용용도": {
      "type": "textarea",
      "required": true,
      "maxLength": 500,
      "placeholder": "투자금 사용 용도를 입력하세요",
      "templateMapping": ["[사용용도]", "[투자목적]"]
    }
  }
}
```

#### 2. 투자 조건 (8개)
```json
{
  "investment_terms": {
    "투자금액": {
      "type": "number",
      "required": true,
      "min": 1000000,
      "max": 100000000000,
      "unit": "원",
      "format": "currency",
      "templateMapping": ["[투자금액]"]
    },
    "투자재원": {
      "type": "select",
      "required": true,
      "options": ["자기자금", "차입금", "혼합"],
      "templateMapping": ["[투자재원]"]
    },
    "투자방식": {
      "type": "select",
      "required": true,
      "options": ["전환우선주", "보통주", "전환사채"],
      "templateMapping": ["[투자방식]"]
    },
    "투자단가": {
      "type": "number",
      "required": true,
      "min": 1,
      "max": 1000000,
      "unit": "원/주",
      "templateMapping": ["[투자단가]", "[주당가격]"]
    },
    "액면가": {
      "type": "number",
      "required": true,
      "default": 500,
      "unit": "원",
      "templateMapping": ["[액면가]"]
    },
    "투자전가치": {
      "type": "number",
      "required": true,
      "min": 1000000,
      "unit": "원",
      "format": "currency",
      "templateMapping": ["[투자전가치]", "[Pre-money]"]
    },
    "투자후가치": {
      "type": "number",
      "required": true,
      "calculated": true,
      "formula": "투자전가치 + 투자금액",
      "dependencies": ["투자전가치", "투자금액"],
      "unit": "원",
      "format": "currency",
      "templateMapping": ["[투자후가치]", "[Post-money]"]
    },
    "동반투자자": {
      "type": "text",
      "required": false,
      "maxLength": 100,
      "placeholder": "동반투자자가 있는 경우 입력",
      "templateMapping": ["[동반투자자]"]
    }
  }
}
```

#### 3. 재무 정보 (5개)
```json
{
  "financial_info": {
    "인수주식수": {
      "type": "number",
      "required": true,
      "calculated": true,
      "formula": "투자금액 / 투자단가",
      "dependencies": ["투자금액", "투자단가"],
      "unit": "주",
      "format": "number",
      "templateMapping": ["[인수주식수]"]
    },
    "지분율": {
      "type": "number",
      "required": true,
      "calculated": true,
      "formula": "(투자금액 / 투자후가치) * 100",
      "dependencies": ["투자금액", "투자후가치"],
      "unit": "%",
      "format": "percentage",
      "templateMapping": ["[지분율]"]
    },
    "상환이자": {
      "type": "number",
      "required": true,
      "min": 0,
      "max": 20,
      "default": 1,
      "unit": "%",
      "templateMapping": ["[상환이자]"]
    },
    "잔여분배이자": {
      "type": "number", 
      "required": true,
      "min": 0,
      "max": 20,
      "default": 1,
      "unit": "%",
      "templateMapping": ["[잔여분배이자]"]
    },
    "주매청이자": {
      "type": "number",
      "required": true,
      "min": 0,
      "max": 30,
      "default": 10,
      "unit": "%",
      "templateMapping": ["[주매청이자]"]
    }
  }
}
```

#### 4. 운영 정보 (3개)
```json
{
  "operation_info": {
    "배당률": {
      "type": "number",
      "required": true,
      "min": 0,
      "max": 10,
      "default": 1,
      "unit": "%",
      "templateMapping": ["[배당률]"]
    },
    "위약벌": {
      "type": "number",
      "required": true,
      "min": 0,
      "max": 50,
      "default": 10,
      "unit": "%",
      "templateMapping": ["[위약벌]"]
    },
    "담당자투자총괄": {
      "type": "text",
      "required": true,
      "maxLength": 30,
      "placeholder": "담당자/투자총괄 이름을 입력하세요",
      "templateMapping": ["[담당자]", "[투자총괄]"]
    }
  }
}
```

## 🔧 핵심 기술 구현

### 1. 동적 폼 생성 엔진
```javascript
class FormGenerator {
  constructor(configPath) {
    this.config = null;
    this.container = null;
    this.fields = new Map();
    this.loadConfig(configPath);
  }

  async loadConfig(configPath) {
    try {
      const response = await fetch(configPath);
      this.config = await response.json();
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  }

  generateForm(containerId) {
    this.container = document.getElementById(containerId);
    
    Object.keys(this.config).forEach(sectionName => {
      const section = this.createSection(sectionName, this.config[sectionName]);
      this.container.appendChild(section);
    });
  }

  createSection(sectionName, sectionConfig) {
    const section = document.createElement('div');
    section.className = 'form-section';
    section.innerHTML = `<h3>${this.getSectionTitle(sectionName)}</h3>`;
    
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'fields-container';
    
    Object.keys(sectionConfig).forEach(fieldName => {
      const field = this.createField(fieldName, sectionConfig[fieldName]);
      fieldsContainer.appendChild(field);
    });
    
    section.appendChild(fieldsContainer);
    return section;
  }

  createField(fieldName, fieldConfig) {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'field-container';
    
    const label = document.createElement('label');
    label.textContent = fieldName;
    label.className = fieldConfig.required ? 'required' : '';
    
    let input;
    switch (fieldConfig.type) {
      case 'text':
        input = this.createTextInput(fieldName, fieldConfig);
        break;
      case 'number':
        input = this.createNumberInput(fieldName, fieldConfig);
        break;
      case 'select':
        input = this.createSelectInput(fieldName, fieldConfig);
        break;
      case 'textarea':
        input = this.createTextareaInput(fieldName, fieldConfig);
        break;
    }
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.style.display = 'none';
    
    fieldContainer.appendChild(label);
    fieldContainer.appendChild(input);
    fieldContainer.appendChild(errorMsg);
    
    this.fields.set(fieldName, {
      element: input,
      config: fieldConfig,
      errorElement: errorMsg
    });
    
    return fieldContainer;
  }
}
```

### 2. 실시간 유효성 검증
```javascript
class DataValidator {
  constructor() {
    this.rules = new Map();
    this.errorMessages = new Map();
  }

  validateField(fieldName, value, config) {
    const errors = [];
    
    // 필수 필드 체크
    if (config.required && (!value || value.trim() === '')) {
      errors.push(`${fieldName}은(는) 필수 입력 항목입니다.`);
    }
    
    // 타입별 검증
    if (value) {
      switch (config.type) {
        case 'number':
          if (isNaN(value)) {
            errors.push(`${fieldName}은(는) 숫자여야 합니다.`);
          } else {
            const num = parseFloat(value);
            if (config.min !== undefined && num < config.min) {
              errors.push(`${fieldName}은(는) ${config.min} 이상이어야 합니다.`);
            }
            if (config.max !== undefined && num > config.max) {
              errors.push(`${fieldName}은(는) ${config.max} 이하여야 합니다.`);
            }
          }
          break;
          
        case 'text':
          if (config.maxLength && value.length > config.maxLength) {
            errors.push(`${fieldName}은(는) ${config.maxLength}자 이하여야 합니다.`);
          }
          if (config.validation) {
            const regex = new RegExp(config.validation);
            if (!regex.test(value)) {
              errors.push(`${fieldName}의 형식이 올바르지 않습니다.`);
            }
          }
          break;
      }
    }
    
    return errors;
  }

  showError(fieldName, message) {
    const field = this.fields.get(fieldName);
    if (field && field.errorElement) {
      field.errorElement.textContent = message;
      field.errorElement.style.display = 'block';
      field.element.classList.add('error');
    }
  }

  clearError(fieldName) {
    const field = this.fields.get(fieldName);
    if (field && field.errorElement) {
      field.errorElement.style.display = 'none';
      field.element.classList.remove('error');
    }
  }
}
```

### 3. 자동 계산 엔진
```javascript
class CalculationEngine {
  constructor() {
    this.formulas = new Map();
    this.dependencies = new Map();
    this.calculated = new Set();
  }

  registerFormula(fieldName, formula, dependencies) {
    this.formulas.set(fieldName, formula);
    this.dependencies.set(fieldName, dependencies);
    this.calculated.add(fieldName);
  }

  calculate(formData, changedField = null) {
    const results = { ...formData };
    
    // 의존성 순서대로 계산
    const calculationOrder = this.getCalculationOrder();
    
    calculationOrder.forEach(fieldName => {
      if (this.formulas.has(fieldName)) {
        const formula = this.formulas.get(fieldName);
        try {
          results[fieldName] = formula(results);
        } catch (error) {
          console.error(`계산 오류 - ${fieldName}:`, error);
          results[fieldName] = 0;
        }
      }
    });
    
    return results;
  }

  getCalculationOrder() {
    // 위상 정렬을 사용하여 의존성 순서 결정
    const visited = new Set();
    const order = [];
    
    const visit = (fieldName) => {
      if (visited.has(fieldName)) return;
      visited.add(fieldName);
      
      const deps = this.dependencies.get(fieldName) || [];
      deps.forEach(dep => visit(dep));
      
      if (this.calculated.has(fieldName)) {
        order.push(fieldName);
      }
    };
    
    this.calculated.forEach(fieldName => visit(fieldName));
    return order;
  }

  // 기본 계산 공식들 등록
  registerDefaultFormulas() {
    // 투자후가치 = 투자전가치 + 투자금액
    this.registerFormula('투자후가치', 
      (data) => (data.투자전가치 || 0) + (data.투자금액 || 0),
      ['투자전가치', '투자금액']
    );

    // 인수주식수 = 투자금액 / 투자단가
    this.registerFormula('인수주식수',
      (data) => {
        if (!data.투자금액 || !data.투자단가) return 0;
        return Math.floor(data.투자금액 / data.투자단가);
      },
      ['투자금액', '투자단가']
    );

    // 지분율 = (투자금액 / 투자후가치) * 100
    this.registerFormula('지분율',
      (data) => {
        if (!data.투자금액 || !data.투자후가치) return 0;
        return ((data.투자금액 / data.투자후가치) * 100).toFixed(2);
      },
      ['투자금액', '투자후가치']
    );
  }
}
```

### 4. 템플릿 처리 시스템
```javascript
class TemplateProcessor {
  constructor() {
    this.templates = new Map();
    this.docxtemplater = null;
    this.initializeLibrary();
  }

  async initializeLibrary() {
    // CDN에서 docxtemplater 로드
    if (typeof window !== 'undefined' && !window.docxtemplater) {
      await this.loadScript('https://unpkg.com/docxtemplater@3.40.0/build/docxtemplater.js');
      await this.loadScript('https://unpkg.com/pizzip@3.1.4/dist/pizzip.js');
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async loadTemplate(templateName, templatePath) {
    try {
      const response = await fetch(templatePath);
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      
      this.templates.set(templateName, {
        zip: zip,
        path: templatePath
      });
      
      return true;
    } catch (error) {
      console.error(`템플릿 로드 실패 - ${templateName}:`, error);
      return false;
    }
  }

  generateDocument(templateName, data) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${templateName}`);
    }

    try {
      const doc = new window.docxtemplater(template.zip, {
        paragraphLoop: true,
        linebreaks: true
      });

      // 변수 치환
      doc.setData(this.prepareData(data));
      doc.render();

      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      return output;
    } catch (error) {
      console.error('문서 생성 실패:', error);
      throw error;
    }
  }

  prepareData(data) {
    const prepared = {};
    
    Object.keys(data).forEach(key => {
      let value = data[key];
      
      // 숫자 포맷팅
      if (typeof value === 'number') {
        if (key.includes('금액') || key.includes('가치')) {
          value = this.formatCurrency(value);
        } else if (key.includes('율') || key.includes('이자')) {
          value = value + '%';
        } else if (key.includes('주식수')) {
          value = this.formatNumber(value) + '주';
        } else {
          value = this.formatNumber(value);
        }
      }
      
      prepared[key] = value || '';
    });
    
    return prepared;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  formatNumber(number) {
    return new Intl.NumberFormat('ko-KR').format(number);
  }

  downloadDocument(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

## 🗂️ 파일 구조 및 네이밍 규칙

### 파일명 생성 규칙
```javascript
function generateFilename(data, documentType) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const companyName = data.투자대상 || '회사명';
  const safeCompanyName = companyName.replace(/[^가-힣a-zA-Z0-9]/g, '_');
  
  return `${dateStr}_${safeCompanyName}_${documentType}.docx`;
}

// 사용 예시
const termsheetFilename = generateFilename(formData, 'TermSheet');
const preliminaryFilename = generateFilename(formData, '예비투심위');
```

### 로컬스토리지 데이터 구조
```javascript
const storageStructure = {
  'investment_doc_generator': {
    'current_data': {
      // 현재 입력 중인 데이터
      '투자대상': '',
      '대표자': '',
      // ... 21개 변수
    },
    'saved_projects': [
      {
        'id': 'project_1',
        'name': '프로젝트명',
        'created_at': '2025-01-23T10:00:00Z',
        'data': { /* 21개 변수 데이터 */ }
      }
    ],
    'settings': {
      'auto_save': true,
      'save_interval': 5000, // 5초
      'language': 'ko'
    }
  }
};
```

## 📱 반응형 CSS 구조

### CSS 변수 정의
```css
:root {
  /* 색상 팔레트 */
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #16a34a;
  --error-color: #dc2626;
  --warning-color: #d97706;
  
  /* 간격 체계 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* 폰트 크기 */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* 반응형 브레이크포인트 */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}
```

### 그리드 시스템
```css
.form-container {
  display: grid;
  gap: var(--spacing-lg);
}

/* Desktop (1200px+) */
@media (min-width: 1200px) {
  .form-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tablet (768px-1199px) */
@media (min-width: 768px) and (max-width: 1199px) {
  .form-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile (767px-) */
@media (max-width: 767px) {
  .form-container {
    grid-template-columns: 1fr;
  }
}
```

---
*작성일: 2025.06.14*  
*버전: v1.0* 