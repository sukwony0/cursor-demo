import { hashPassword, verifyPassword, createUserStore, createSessionStore, login } from './auth.js';

describe('hashPassword / verifyPassword', () => {
    test('올바른 비밀번호는 검증에 성공한다', () => {
        const { salt, hash } = hashPassword('s3cret-pass');
        expect(verifyPassword('s3cret-pass', salt, hash)).toBe(true);
    });

    test('틀린 비밀번호는 검증에 실패한다', () => {
        const { salt, hash } = hashPassword('s3cret-pass');
        expect(verifyPassword('wrong-pass', salt, hash)).toBe(false);
    });

    test('동일 비밀번호라도 salt가 다르면 해시가 다르다', () => {
        const a = hashPassword('same-pass');
        const b = hashPassword('same-pass');
        expect(a.hash).not.toBe(b.hash);
    });

    test('빈 비밀번호는 예외를 던진다', () => {
        expect(() => hashPassword('')).toThrow();
    });
});

describe('login', () => {
    /** @returns {{ userStore: any, sessionStore: any }} 시드된 저장소 */
    function setup() {
        const userStore = createUserStore();
        const sessionStore = createSessionStore();
        userStore.addUser('user@example.com', 'correct-horse');
        return { userStore, sessionStore };
    }

    test('올바른 자격증명으로 토큰을 발급한다', () => {
        const stores = setup();
        const token = login(stores, 'user@example.com', 'correct-horse');
        expect(typeof token).toBe('string');
        expect(stores.sessionStore.get(token)).toEqual({ email: 'user@example.com' });
    });

    test('대소문자/공백이 달라도 이메일을 정규화해 로그인한다', () => {
        const stores = setup();
        const token = login(stores, '  USER@Example.com ', 'correct-horse');
        expect(typeof token).toBe('string');
    });

    test('틀린 비밀번호는 null을 반환한다', () => {
        const stores = setup();
        expect(login(stores, 'user@example.com', 'nope')).toBeNull();
    });

    test('존재하지 않는 사용자는 null을 반환한다', () => {
        const stores = setup();
        expect(login(stores, 'ghost@example.com', 'whatever')).toBeNull();
    });

    test('비문자열 입력은 null을 반환한다', () => {
        const stores = setup();
        expect(login(stores, null, 123)).toBeNull();
    });
});

describe('createSessionStore', () => {
    test('만료된 세션은 null을 반환한다', () => {
        const sessionStore = createSessionStore(-1);
        const token = sessionStore.create('user@example.com');
        expect(sessionStore.get(token)).toBeNull();
    });

    test('존재하지 않는 토큰은 null을 반환한다', () => {
        const sessionStore = createSessionStore();
        expect(sessionStore.get('nope')).toBeNull();
    });
});
