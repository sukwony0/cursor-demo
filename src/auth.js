import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { isValidEmail, normalizeEmail } from './email.js';

// scrypt 파생 키 길이(바이트). 비밀번호 해시 저장에 사용한다. by sukwon
const KEY_LENGTH = 64;
// 세션 만료 시간(밀리초). 기본 1시간. by sukwon
const SESSION_TTL_MS = 60 * 60 * 1000;

/**
 * 비밀번호를 salt와 함께 scrypt로 해싱한다.
 * @param {string} password 평문 비밀번호
 * @param {string} [salt] 16바이트 hex salt. 미지정 시 무작위 생성한다.
 * @returns {{ salt: string, hash: string }} salt와 해시(hex 문자열)
 */
export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
    if (typeof password !== 'string' || password.length === 0) {
        throw new TypeError('비밀번호는 비어 있지 않은 문자열이어야 합니다.');
    }
    const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
    return { salt, hash };
}

/**
 * 평문 비밀번호가 저장된 해시와 일치하는지 타이밍 안전 비교로 검증한다.
 * @param {string} password 검증할 평문 비밀번호
 * @param {string} salt 저장된 salt
 * @param {string} expectedHash 저장된 해시(hex 문자열)
 * @returns {boolean} 일치하면 true
 */
export function verifyPassword(password, salt, expectedHash) {
    if (typeof password !== 'string' || typeof salt !== 'string' || typeof expectedHash !== 'string') {
        return false;
    }
    const actual = scryptSync(password, salt, KEY_LENGTH);
    const expected = Buffer.from(expectedHash, 'hex');
    // 길이가 다르면 timingSafeEqual이 예외를 던지므로 먼저 확인한다. by sukwon
    if (actual.length !== expected.length) {
        return false;
    }
    return timingSafeEqual(actual, expected);
}

/**
 * 인메모리 사용자 저장소를 생성한다. (데모용 — 실제 서비스에서는 DB 사용)
 * @returns {{ addUser: (email: string, password: string) => void, getUser: (email: string) => ({ email: string, salt: string, hash: string } | undefined) }}
 */
export function createUserStore() {
    const users = new Map();
    return {
        /**
         * 사용자를 등록한다. 비밀번호는 해시로만 저장한다.
         * @param {string} email 사용자 이메일
         * @param {string} password 평문 비밀번호
         * @returns {void}
         */
        addUser(email, password) {
            if (!isValidEmail(email)) {
                throw new TypeError('유효하지 않은 이메일입니다.');
            }
            const key = normalizeEmail(email);
            const { salt, hash } = hashPassword(password);
            users.set(key, { email: key, salt, hash });
        },
        /**
         * 이메일로 사용자를 조회한다.
         * @param {string} email 조회할 이메일
         * @returns {({ email: string, salt: string, hash: string } | undefined)} 사용자 또는 undefined
         */
        getUser(email) {
            return users.get(normalizeEmail(email));
        },
    };
}

/**
 * 인메모리 세션 저장소를 생성한다. (데모용)
 * @param {number} [ttlMs] 세션 만료 시간(밀리초)
 * @returns {{ create: (email: string) => string, get: (token: string) => ({ email: string } | null) }}
 */
export function createSessionStore(ttlMs = SESSION_TTL_MS) {
    const sessions = new Map();
    return {
        /**
         * 새 세션 토큰을 발급한다.
         * @param {string} email 세션 주체 이메일
         * @returns {string} 무작위 세션 토큰(hex)
         */
        create(email) {
            const token = randomBytes(32).toString('hex');
            sessions.set(token, { email, expiresAt: Date.now() + ttlMs });
            return token;
        },
        /**
         * 토큰으로 유효한 세션을 조회한다. 만료된 세션은 제거하고 null을 반환한다.
         * @param {string} token 세션 토큰
         * @returns {({ email: string } | null)} 유효한 세션 또는 null
         */
        get(token) {
            const session = sessions.get(token);
            if (!session) {
                return null;
            }
            if (Date.now() > session.expiresAt) {
                sessions.delete(token);
                return null;
            }
            return { email: session.email };
        },
    };
}

/**
 * 이메일/비밀번호로 로그인하여 세션 토큰을 발급한다.
 * 실패 시 사용자 존재 여부를 노출하지 않도록 항상 동일한 결과(null)를 반환한다.
 * @param {object} deps 의존성
 * @param {ReturnType<typeof createUserStore>} deps.userStore 사용자 저장소
 * @param {ReturnType<typeof createSessionStore>} deps.sessionStore 세션 저장소
 * @param {unknown} email 입력 이메일
 * @param {unknown} password 입력 비밀번호
 * @returns {string | null} 성공 시 세션 토큰, 실패 시 null
 */
export function login({ userStore, sessionStore }, email, password) {
    if (typeof email !== 'string' || typeof password !== 'string') {
        return null;
    }
    const user = userStore.getUser(email);
    // 사용자가 없어도 더미 검증을 수행해 응답 시간 차이로 인한 사용자 열거를 줄인다. by sukwon
    const salt = user ? user.salt : 'invalid';
    const hash = user ? user.hash : 'invalid';
    const ok = verifyPassword(password, salt, hash);
    if (!user || !ok) {
        return null;
    }
    return sessionStore.create(user.email);
}
