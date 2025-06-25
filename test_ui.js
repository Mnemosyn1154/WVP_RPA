const puppeteer = require('puppeteer');

async function testConditionalFields() {
    const browser = await puppeteer.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();
    
    // 콘솔 로그 수집
    page.on('console', msg => console.log('🖥️  브라우저:', msg.text()));
    page.on('pageerror', err => console.log('❌ 페이지 에러:', err.message));
    
    try {
        console.log('🚀 브라우저 시작...');
        
        // 페이지 로드
        await page.goto('http://localhost:8083', { waitUntil: 'networkidle2' });
        console.log('📄 페이지 로드 완료');
        
        // 폼이 생성될 때까지 대기
        await page.waitForSelector('#formContainer', { timeout: 15000 });
        console.log('📋 폼 컨테이너 발견');
        
        // 실제 DOM 구조 확인
        const elements = await page.evaluate(() => {
            const container = document.querySelector('#formContainer');
            const spinner = document.querySelector('#loadingSpinner');
            const sections = document.querySelectorAll('.form-section');
            return {
                hasContainer: !!container,
                hasSpinner: !!spinner,
                spinnerVisible: spinner ? spinner.style.display !== 'none' : false,
                sectionsCount: sections.length,
                containerHTML: container ? container.innerHTML.substring(0, 500) : 'None'
            };
        });
        console.log('🔍 DOM 상태:', elements);
        
        // 간단히 시간 기반으로 대기
        console.log('⏳ 10초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 투자방식 필드 찾기 (더 구체적인 셀렉터 사용)
        const investmentTypeSelector = 'select[name="투자방식"], [data-field-name="투자방식"] select';
        await page.waitForSelector(investmentTypeSelector, { timeout: 10000 });
        console.log('💰 투자방식 필드 발견');
        
        // 현재 상환이자 필드 상태 확인
        const checkFieldVisibility = async (fieldName, expectedVisible) => {
            const field = await page.$(`[name="${fieldName}"]`);
            if (!field) {
                console.log(`❌ ${fieldName} 필드를 찾을 수 없습니다`);
                return false;
            }
            
            const isVisible = await field.evaluate(el => {
                const style = window.getComputedStyle(el.closest('[data-field-id]'));
                return style.display !== 'none';
            });
            
            const status = isVisible === expectedVisible ? '✅' : '❌';
            console.log(`${status} ${fieldName} 필드 가시성: ${isVisible} (예상: ${expectedVisible})`);
            return isVisible === expectedVisible;
        };
        
        // 테스트 1: 기본값 (전환상환우선주) - 모든 필드 표시
        console.log('\n📊 테스트 1: 전환상환우선주 (기본값)');
        await checkFieldVisibility('상환이자', true);
        await checkFieldVisibility('잔여분배이자', true);
        await checkFieldVisibility('배당률', true);
        
        // 테스트 2: 보통주 선택 - 상환이자, 잔여분배이자 숨김
        console.log('\n📊 테스트 2: 보통주 선택');
        await page.select(investmentTypeSelector, '보통주');
        await new Promise(resolve => setTimeout(resolve, 1000)); // 조건부 로직 실행 대기
        
        await checkFieldVisibility('상환이자', false);
        await checkFieldVisibility('잔여분배이자', false);
        await checkFieldVisibility('배당률', true);
        
        // 테스트 3: 전환우선주 선택 - 상환이자만 숨김
        console.log('\n📊 테스트 3: 전환우선주 선택');
        await page.select(investmentTypeSelector, '전환우선주');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await checkFieldVisibility('상환이자', false);
        await checkFieldVisibility('잔여분배이자', true);
        await checkFieldVisibility('배당률', true);
        
        // 테스트 4: 전환사채 선택 - 잔여분배이자, 배당률 숨김 + 라벨 변경
        console.log('\n📊 테스트 4: 전환사채 선택');
        await page.select(investmentTypeSelector, '전환사채');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await checkFieldVisibility('상환이자', true);
        await checkFieldVisibility('잔여분배이자', false);
        await checkFieldVisibility('배당률', false);
        
        // 라벨 변경 확인
        const shareCountLabel = await page.$eval('[name="인수주식수"]', el => {
            const labelEl = el.closest('[data-field-id]').querySelector('.form-field-label');
            return labelEl ? labelEl.textContent : null;
        });
        
        const equityRateLabel = await page.$eval('[name="지분율"]', el => {
            const labelEl = el.closest('[data-field-id]').querySelector('.form-field-label');
            return labelEl ? labelEl.textContent : null;
        });
        
        console.log(`📝 인수주식수 라벨: "${shareCountLabel}" (예상: "전환주식수")`);
        console.log(`📝 지분율 라벨: "${equityRateLabel}" (예상: "전환시지분율")`);
        
        // 테스트 5: 다시 전환상환우선주로 되돌리기
        console.log('\n📊 테스트 5: 전환상환우선주로 복원');
        await page.select(investmentTypeSelector, '전환상환우선주');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await checkFieldVisibility('상환이자', true);
        await checkFieldVisibility('잔여분배이자', true);
        await checkFieldVisibility('배당률', true);
        
        console.log('\n🎉 모든 테스트 완료!');
        console.log('⏳ 5초 후 브라우저를 닫습니다...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error);
        await page.screenshot({ path: 'test_error.png' });
        console.log('📸 에러 스크린샷 저장: test_error.png');
    } finally {
        await browser.close();
    }
}

testConditionalFields().catch(console.error);