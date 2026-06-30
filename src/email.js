/**
 * 사용자 배열에서 이메일 값만 추출한다.
 * @param {Array<{email?: unknown}>} users 사용자 객체 배열
 * @returns {Array<unknown>} 각 사용자의 email 값 배열 (배열이 아니면 빈 배열)
 */
export function extractEmails(users) {
    if (!Array.isArray(users)) {
        return [];
    }
    return users
        .filter(user => user != null)
        .map(user => user.email);
}

/**
 * 이메일 형식이 유효한지 검증한다.
 * 정규식 출처: WHATWG HTML Living Standard - "valid e-mail address" (RFC 5322의 의도적 부분 구현)
 * https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
 * @param {unknown} email 검증할 값
 * @returns {boolean} 유효한 이메일 형식이면 true
 */
export function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

/**
 * 이메일 문자열을 정규화한다. 앞뒤 공백을 제거하고 소문자로 변환한다.
 * @param {unknown} email 정규화할 값
 * @returns {string} 정규화된 이메일 (문자열이 아니면 빈 문자열)
 */
export function normalizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

/**
 * 사용자 배열에서 유효한 이메일만 추출한다.
 * @param {Array<{email?: unknown}>} users 사용자 객체 배열
 * @returns {Array<string>} 유효한 이메일 문자열 배열
 */
export function getValidEmails(users) {
    return extractEmails(users).filter(isValidEmail);
}

/**
 * 이메일 배열에서 정규화 기준으로 중복을 제거한다. 첫 등장 순서를 유지한다.
 * @param {Array<unknown>} emails 이메일 값 배열
 * @returns {Array<string>} 정규화된 중복 없는 이메일 배열 (빈 문자열로 정규화되는 값은 제외)
 */
export function dedupeEmails(emails) {
    if (!Array.isArray(emails)) {
        return [];
    }
    const seen = new Set();
    const result = [];
    for (const email of emails) {
        const normalized = normalizeEmail(email);
        if (normalized === '' || seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);
        result.push(normalized);
    }
    return result;
}
