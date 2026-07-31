/**
 * 건강검진 분석 로직 단위 테스트
 */

const { healthStandards, evaluateValue } = require('./health-analyzer.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
        failed++;
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

// 공복혈당 테스트
test('공복혈당 정상 범위 (90)', () => {
    const result = evaluateValue(90, healthStandards.glucose);
    assertEquals(result.status, 'normal', '정상 상태여야 함');
    assertEquals(result.label, '정상');
});

test('공복혈당 공복혈당장애 (110)', () => {
    const result = evaluateValue(110, healthStandards.glucose);
    assertEquals(result.status, 'warning', '경고 상태여야 함');
    assertEquals(result.label, '공복혈당장애');
});

test('공복혈당 당뇨병 의심 (130)', () => {
    const result = evaluateValue(130, healthStandards.glucose);
    assertEquals(result.status, 'danger', '위험 상태여야 함');
    assertEquals(result.label, '당뇨병 의심');
});

// 총 콜레스테롤 테스트
test('총 콜레스테롤 정상 (180)', () => {
    const result = evaluateValue(180, healthStandards.totalCholesterol);
    assertEquals(result.status, 'normal');
});

test('총 콜레스테롤 경계 (220)', () => {
    const result = evaluateValue(220, healthStandards.totalCholesterol);
    assertEquals(result.status, 'warning');
});

test('총 콜레스테롤 높음 (250)', () => {
    const result = evaluateValue(250, healthStandards.totalCholesterol);
    assertEquals(result.status, 'danger');
});

// HDL 테스트
test('HDL 낮음 (35)', () => {
    const result = evaluateValue(35, healthStandards.hdl);
    assertEquals(result.status, 'danger');
});

test('HDL 경계 (45)', () => {
    const result = evaluateValue(45, healthStandards.hdl);
    assertEquals(result.status, 'warning');
});

test('HDL 정상 (65)', () => {
    const result = evaluateValue(65, healthStandards.hdl);
    assertEquals(result.status, 'normal');
});

// LDL 테스트
test('LDL 정상 (100)', () => {
    const result = evaluateValue(100, healthStandards.ldl);
    assertEquals(result.status, 'normal');
});

test('LDL 경계 (140)', () => {
    const result = evaluateValue(140, healthStandards.ldl);
    assertEquals(result.status, 'warning');
});

test('LDL 높음 (180)', () => {
    const result = evaluateValue(180, healthStandards.ldl);
    assertEquals(result.status, 'danger');
});

// 중성지방 테스트
test('중성지방 정상 (100)', () => {
    const result = evaluateValue(100, healthStandards.triglycerides);
    assertEquals(result.status, 'normal');
});

test('중성지방 경계 (180)', () => {
    const result = evaluateValue(180, healthStandards.triglycerides);
    assertEquals(result.status, 'warning');
});

test('중성지방 높음 (250)', () => {
    const result = evaluateValue(250, healthStandards.triglycerides);
    assertEquals(result.status, 'danger');
});

// 간수치 AST 테스트
test('AST 정상 (30)', () => {
    const result = evaluateValue(30, healthStandards.ast);
    assertEquals(result.status, 'normal');
});

test('AST 경증 상승 (60)', () => {
    const result = evaluateValue(60, healthStandards.ast);
    assertEquals(result.status, 'warning');
});

test('AST 상승 (100)', () => {
    const result = evaluateValue(100, healthStandards.ast);
    assertEquals(result.status, 'danger');
});

// 간수치 ALT 테스트
test('ALT 정상 (25)', () => {
    const result = evaluateValue(25, healthStandards.alt);
    assertEquals(result.status, 'normal');
});

test('ALT 경증 상승 (50)', () => {
    const result = evaluateValue(50, healthStandards.alt);
    assertEquals(result.status, 'warning');
});

test('ALT 상승 (90)', () => {
    const result = evaluateValue(90, healthStandards.alt);
    assertEquals(result.status, 'danger');
});

// 혈압 테스트
test('혈압 정상 (110/70)', () => {
    const result = healthStandards.bloodPressure.evaluate(110, 70);
    assertEquals(result.status, 'normal');
});

test('혈압 주의 (125/82)', () => {
    const result = healthStandards.bloodPressure.evaluate(125, 82);
    assertEquals(result.status, 'warning');
});

test('혈압 고혈압 전단계 (135/85)', () => {
    const result = healthStandards.bloodPressure.evaluate(135, 85);
    assertEquals(result.status, 'warning');
    assertEquals(result.label, '고혈압 전단계');
});

test('혈압 1단계 고혈압 (150/95)', () => {
    const result = healthStandards.bloodPressure.evaluate(150, 95);
    assertEquals(result.status, 'danger');
    assertEquals(result.label, '1단계 고혈압');
});

test('혈압 2단계 고혈압 (170/105)', () => {
    const result = healthStandards.bloodPressure.evaluate(170, 105);
    assertEquals(result.status, 'danger');
    assertEquals(result.label, '2단계 고혈압');
});

// BMI 테스트
test('BMI 저체중 (17.5)', () => {
    const result = evaluateValue(17.5, healthStandards.bmi);
    assertEquals(result.status, 'warning');
    assertEquals(result.label, '저체중');
});

test('BMI 정상 (21.0)', () => {
    const result = evaluateValue(21.0, healthStandards.bmi);
    assertEquals(result.status, 'normal');
});

test('BMI 과체중 (24.0)', () => {
    const result = evaluateValue(24.0, healthStandards.bmi);
    assertEquals(result.status, 'warning');
    assertEquals(result.label, '과체중');
});

test('BMI 1단계 비만 (27.0)', () => {
    const result = evaluateValue(27.0, healthStandards.bmi);
    assertEquals(result.status, 'danger');
    assertEquals(result.label, '1단계 비만');
});

test('BMI 2단계 비만 (32.0)', () => {
    const result = evaluateValue(32.0, healthStandards.bmi);
    assertEquals(result.status, 'danger');
    assertEquals(result.label, '2단계 비만');
});

// 경계값 테스트
test('공복혈당 경계값 정확히 99 (정상)', () => {
    const result = evaluateValue(99, healthStandards.glucose);
    assertEquals(result.status, 'normal');
});

test('공복혈당 경계값 100 (공복혈당장애)', () => {
    const result = evaluateValue(100, healthStandards.glucose);
    assertEquals(result.status, 'warning');
});

test('공복혈당 경계값 정확히 125 (공복혈당장애)', () => {
    const result = evaluateValue(125, healthStandards.glucose);
    assertEquals(result.status, 'warning');
});

test('공복혈당 경계값 126 (당뇨병 의심)', () => {
    const result = evaluateValue(126, healthStandards.glucose);
    assertEquals(result.status, 'danger');
});

// 결과 출력
console.log('\n========================================');
console.log(`테스트 결과: ${passed} 통과, ${failed} 실패`);
console.log('========================================');

if (failed > 0) {
    process.exit(1);
} else {
    console.log('\n✅ 모든 테스트 통과!');
    process.exit(0);
}
