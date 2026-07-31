/**
 * 건강검진 결과 분석 로직
 * 
 * 기준 출처:
 * - 공복혈당: 대한당뇨병학회 진료지침 2021
 * - 콜레스테롤: 한국지질·동맥경화학회 이상지질혈증 치료지침 2022
 * - 간수치: 대한간학회 가이드라인
 * - 혈압: 대한고혈압학회 고혈압 진료지침 2022
 * - BMI: 대한비만학회 비만 진료지침 2022 (아시아-태평양 기준)
 */

// 검사 항목별 기준치 및 해석
const healthStandards = {
    glucose: {
        name: '공복혈당',
        unit: 'mg/dL',
        ranges: [
            { max: 99, status: 'normal', label: '정상', description: '혈당이 정상 범위입니다. 현재 상태를 유지하세요.' },
            { max: 125, status: 'warning', label: '공복혈당장애', description: '당뇨병 전단계입니다. 식습관 개선과 운동이 필요하며, 정기적인 검사를 권장합니다.' },
            { max: Infinity, status: 'danger', label: '당뇨병 의심', description: '당뇨병이 의심됩니다. 반드시 의사와 상담하여 정밀 검사를 받으세요.' }
        ],
        normalRange: '70-99 mg/dL'
    },
    totalCholesterol: {
        name: '총 콜레스테롤',
        unit: 'mg/dL',
        ranges: [
            { max: 199, status: 'normal', label: '정상', description: '콜레스테롤 수치가 정상입니다. 건강한 식습관을 유지하세요.' },
            { max: 239, status: 'warning', label: '경계', description: '콜레스테롤이 높은 편입니다. 기름진 음식을 줄이고 운동을 늘리세요.' },
            { max: Infinity, status: 'danger', label: '높음', description: '콜레스테롤이 매우 높습니다. 심혈관 질환 위험이 증가하므로 의사와 상담이 필요합니다.' }
        ],
        normalRange: '200 미만 mg/dL'
    },
    hdl: {
        name: 'HDL 콜레스테롤',
        unit: 'mg/dL',
        ranges: [
            { max: 39, status: 'danger', label: '낮음', description: 'HDL(좋은 콜레스테롤)이 너무 낮습니다. 유산소 운동을 늘리고 금연하세요.' },
            { max: 59, status: 'warning', label: '경계', description: 'HDL이 약간 낮은 편입니다. 운동과 건강한 지방 섭취로 개선할 수 있습니다.' },
            { max: Infinity, status: 'normal', label: '정상', description: 'HDL(좋은 콜레스테롤)이 적정 수준입니다. 훌륭합니다!' }
        ],
        normalRange: '남성 40 이상, 여성 50 이상 mg/dL'
    },
    ldl: {
        name: 'LDL 콜레스테롤',
        unit: 'mg/dL',
        ranges: [
            { max: 129, status: 'normal', label: '정상', description: 'LDL(나쁜 콜레스테롤)이 정상 범위입니다.' },
            { max: 159, status: 'warning', label: '경계', description: 'LDL이 높은 편입니다. 포화지방 섭취를 줄이세요.' },
            { max: Infinity, status: 'danger', label: '높음', description: 'LDL이 매우 높습니다. 심혈관 질환 위험이 높으므로 치료가 필요할 수 있습니다.' }
        ],
        normalRange: '130 미만 mg/dL'
    },
    triglycerides: {
        name: '중성지방',
        unit: 'mg/dL',
        ranges: [
            { max: 149, status: 'normal', label: '정상', description: '중성지방 수치가 정상입니다.' },
            { max: 199, status: 'warning', label: '경계', description: '중성지방이 높은 편입니다. 당분과 탄수화물 섭취를 줄이고 운동하세요.' },
            { max: Infinity, status: 'danger', label: '높음', description: '중성지방이 매우 높습니다. 췌장염 위험이 있으므로 적극적인 관리가 필요합니다.' }
        ],
        normalRange: '150 미만 mg/dL'
    },
    ast: {
        name: 'AST (간수치)',
        unit: 'U/L',
        ranges: [
            { max: 40, status: 'normal', label: '정상', description: 'AST 수치가 정상입니다.' },
            { max: 80, status: 'warning', label: '경증 상승', description: 'AST가 약간 높습니다. 음주를 줄이고 간 건강을 체크하세요.' },
            { max: Infinity, status: 'danger', label: '상승', description: 'AST가 많이 높습니다. 간 질환 가능성이 있으므로 정밀 검사가 필요합니다.' }
        ],
        normalRange: '0-40 U/L'
    },
    alt: {
        name: 'ALT (간수치)',
        unit: 'U/L',
        ranges: [
            { max: 40, status: 'normal', label: '정상', description: 'ALT 수치가 정상입니다.' },
            { max: 80, status: 'warning', label: '경증 상승', description: 'ALT가 약간 높습니다. 지방간이나 간염 가능성이 있으니 관리가 필요합니다.' },
            { max: Infinity, status: 'danger', label: '상승', description: 'ALT가 많이 높습니다. 간 손상이 의심되므로 반드시 의사와 상담하세요.' }
        ],
        normalRange: '0-40 U/L'
    },
    bloodPressure: {
        name: '혈압',
        unit: 'mmHg',
        // 혈압은 수축기/이완기 조합으로 판단
        evaluate: (sbp, dbp) => {
            if (sbp < 120 && dbp < 80) {
                return {
                    status: 'normal',
                    label: '정상',
                    description: '혈압이 정상 범위입니다. 건강한 생활습관을 유지하세요.'
                };
            } else if (sbp < 130 && dbp < 85) {
                return {
                    status: 'warning',
                    label: '주의',
                    description: '혈압이 약간 높은 편입니다. 저염식과 규칙적인 운동으로 관리하세요.'
                };
            } else if (sbp < 140 && dbp < 90) {
                return {
                    status: 'warning',
                    label: '고혈압 전단계',
                    description: '고혈압 전단계입니다. 생활습관 개선이 필요하며 정기적인 혈압 체크를 권장합니다.'
                };
            } else if (sbp < 160 && dbp < 100) {
                return {
                    status: 'danger',
                    label: '1단계 고혈압',
                    description: '고혈압입니다. 의사와 상담하여 치료를 시작해야 합니다.'
                };
            } else {
                return {
                    status: 'danger',
                    label: '2단계 고혈압',
                    description: '고혈압이 심각한 수준입니다. 즉시 의사와 상담하여 치료를 받으세요.'
                };
            }
        },
        normalRange: '수축기 120 미만 / 이완기 80 미만 mmHg'
    },
    bmi: {
        name: 'BMI (체질량지수)',
        unit: 'kg/m²',
        ranges: [
            { max: 18.4, status: 'warning', label: '저체중', description: '체중이 부족합니다. 균형잡힌 식사로 적정 체중을 유지하세요.' },
            { max: 22.9, status: 'normal', label: '정상', description: '체중이 정상 범위입니다. 현재 상태를 유지하세요.' },
            { max: 24.9, status: 'warning', label: '과체중', description: '체중이 약간 많은 편입니다. 식사량 조절과 운동을 시작하세요.' },
            { max: 29.9, status: 'danger', label: '1단계 비만', description: '비만입니다. 체중 감량이 필요하며 건강 위험이 증가합니다.' },
            { max: Infinity, status: 'danger', label: '2단계 비만', description: '고도 비만입니다. 적극적인 체중 관리와 의료 상담이 필요합니다.' }
        ],
        normalRange: '18.5-22.9 kg/m² (아시아-태평양 기준)'
    }
};

/**
 * 단일 수치를 평가하는 함수
 */
function evaluateValue(value, standard) {
    for (const range of standard.ranges) {
        if (value <= range.max) {
            return {
                status: range.status,
                label: range.label,
                description: range.description
            };
        }
    }
    // 기본값 (도달하지 않아야 함)
    return standard.ranges[standard.ranges.length - 1];
}

/**
 * 결과 카드 HTML 생성
 */
function createResultCard(name, value, unit, evaluation, normalRange) {
    return `
        <div class="result-card ${evaluation.status}">
            <div class="result-header">
                <span class="result-name">${name}</span>
                <span class="result-status ${evaluation.status}">${evaluation.label}</span>
            </div>
            <div class="result-value">${value} ${unit}</div>
            <div class="result-range">정상 범위: ${normalRange}</div>
            <div class="result-description">${evaluation.description}</div>
        </div>
    `;
}

/**
 * 메인 분석 함수
 */
function analyzeResults() {
    // 입력값 가져오기
    const inputs = {
        glucose: parseFloat(document.getElementById('glucose').value),
        totalCholesterol: parseFloat(document.getElementById('totalCholesterol').value),
        hdl: parseFloat(document.getElementById('hdl').value),
        ldl: parseFloat(document.getElementById('ldl').value),
        triglycerides: parseFloat(document.getElementById('triglycerides').value),
        ast: parseFloat(document.getElementById('ast').value),
        alt: parseFloat(document.getElementById('alt').value),
        sbp: parseFloat(document.getElementById('sbp').value),
        dbp: parseFloat(document.getElementById('dbp').value),
        bmi: parseFloat(document.getElementById('bmi').value)
    };

    // 입력된 값이 하나도 없으면 경고
    const hasAnyInput = Object.values(inputs).some(val => !isNaN(val) && val > 0);
    if (!hasAnyInput) {
        alert('최소 하나 이상의 수치를 입력해주세요.');
        return;
    }

    // 결과 컨테이너
    const resultsDiv = document.getElementById('results');
    let resultsHTML = '<h2 style="margin-bottom: 16px; font-size: 18px;">📊 분석 결과</h2>';

    // 각 항목 분석
    if (!isNaN(inputs.glucose) && inputs.glucose > 0) {
        const std = healthStandards.glucose;
        const eval = evaluateValue(inputs.glucose, std);
        resultsHTML += createResultCard(std.name, inputs.glucose, std.unit, eval, std.normalRange);
    }

    if (!isNaN(inputs.totalCholesterol) && inputs.totalCholesterol > 0) {
        const std = healthStandards.totalCholesterol;
        const eval = evaluateValue(inputs.totalCholesterol, std);
        resultsHTML += createResultCard(std.name, inputs.totalCholesterol, std.unit, eval, std.normalRange);
    }

    if (!isNaN(inputs.hdl) && inputs.hdl > 0) {
        const std = healthStandards.hdl;
        const eval = evaluateValue(inputs.hdl, std);
        resultsHTML += createResultCard(std.name, inputs.hdl, std.unit, eval, std.normalRange);
    }

    if (!isNaN(inputs.ldl) && inputs.ldl > 0) {
        const std = healthStandards.ldl;
        const eval = evaluateValue(inputs.ldl, std);
        resultsHTML += createResultCard(std.name, inputs.ldl, std.unit, eval, std.normalRange);
    }

    if (!isNaN(inputs.triglycerides) && inputs.triglycerides > 0) {
        const std = healthStandards.triglycerides;
        const eval = evaluateValue(inputs.triglycerides, std);
        resultsHTML += createResultCard(std.name, inputs.triglycerides, std.unit, eval, std.normalRange);
    }

    if (!isNaN(inputs.ast) && inputs.ast > 0) {
        const std = healthStandards.ast;
        const eval = evaluateValue(inputs.ast, std);
        resultsHTML += createResultCard(std.name, inputs.ast, std.unit, eval, std.normalRange);
    }

    if (!isNaN(inputs.alt) && inputs.alt > 0) {
        const std = healthStandards.alt;
        const eval = evaluateValue(inputs.alt, std);
        resultsHTML += createResultCard(std.name, inputs.alt, std.unit, eval, std.normalRange);
    }

    // 혈압 (수축기와 이완기 모두 있어야 평가)
    if (!isNaN(inputs.sbp) && inputs.sbp > 0 && !isNaN(inputs.dbp) && inputs.dbp > 0) {
        const std = healthStandards.bloodPressure;
        const eval = std.evaluate(inputs.sbp, inputs.dbp);
        resultsHTML += createResultCard(std.name, `${inputs.sbp}/${inputs.dbp}`, std.unit, eval, std.normalRange);
    }

    if (!isNaN(inputs.bmi) && inputs.bmi > 0) {
        const std = healthStandards.bmi;
        const eval = evaluateValue(inputs.bmi, std);
        resultsHTML += createResultCard(std.name, inputs.bmi, std.unit, eval, std.normalRange);
    }

    // 결과 표시
    resultsDiv.innerHTML = resultsHTML;
    resultsDiv.classList.remove('hidden');

    // 결과로 스크롤
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Node.js 환경에서 테스트를 위한 export (브라우저에서는 무시됨)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        healthStandards,
        evaluateValue,
        analyzeResults
    };
}
