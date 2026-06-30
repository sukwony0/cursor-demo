import { extractEmails, isValidEmail, normalizeEmail, getValidEmails, dedupeEmails } from './email.js';

describe('extractEmails', () => {
    test('사용자 배열에서 email 속성만 추출한다', () => {
        const users = [
            { name: 'Alice', email: 'alice@example.com' },
            { name: 'Bob', email: 'bob@test.org' },
        ];
        expect(extractEmails(users)).toEqual(['alice@example.com', 'bob@test.org']);
    });

    test('배열이 아니면 빈 배열을 반환한다', () => {
        expect(extractEmails(null)).toEqual([]);
        expect(extractEmails(undefined)).toEqual([]);
        expect(extractEmails('nope')).toEqual([]);
    });

    test('null/undefined 요소는 건너뛴다', () => {
        const users = [{ email: 'a@a.com' }, null, undefined];
        expect(extractEmails(users)).toEqual(['a@a.com']);
    });
});

describe('isValidEmail', () => {
    test('유효한 이메일은 true를 반환한다', () => {
        expect(isValidEmail('alice@example.com')).toBe(true);
        expect(isValidEmail("o'brien+tag@sub.example.co.uk")).toBe(true);
    });

    test('유효하지 않은 이메일은 false를 반환한다', () => {
        expect(isValidEmail('not-an-email')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('a b@example.com')).toBe(false);
        expect(isValidEmail('')).toBe(false);
    });

    test('문자열이 아니면 false를 반환한다', () => {
        expect(isValidEmail(null)).toBe(false);
        expect(isValidEmail(123)).toBe(false);
        expect(isValidEmail(undefined)).toBe(false);
    });
});

describe('normalizeEmail', () => {
    test('앞뒤 공백을 제거하고 소문자로 변환한다', () => {
        expect(normalizeEmail('  Alice@Example.COM  ')).toBe('alice@example.com');
    });

    test('이미 정규화된 이메일은 그대로 반환한다', () => {
        expect(normalizeEmail('bob@test.org')).toBe('bob@test.org');
    });

    test('문자열이 아니면 빈 문자열을 반환한다', () => {
        expect(normalizeEmail(null)).toBe('');
        expect(normalizeEmail(123)).toBe('');
        expect(normalizeEmail(undefined)).toBe('');
    });
});

describe('getValidEmails', () => {
    test('유효한 이메일만 추출한다', () => {
        const users = [
            { name: 'Alice', email: 'alice@example.com' },
            { name: 'Bob', email: 'not-an-email' },
            { name: 'Carol', email: 'carol@test.org' },
        ];
        expect(getValidEmails(users)).toEqual(['alice@example.com', 'carol@test.org']);
    });

    test('유효한 이메일이 없으면 빈 배열을 반환한다', () => {
        const users = [{ email: 'bad' }, { email: 123 }];
        expect(getValidEmails(users)).toEqual([]);
    });
});

describe('dedupeEmails', () => {
    test('정규화 기준으로 중복을 제거하고 순서를 유지한다', () => {
        const emails = ['Alice@Example.com', '  alice@example.com ', 'bob@test.org'];
        expect(dedupeEmails(emails)).toEqual(['alice@example.com', 'bob@test.org']);
    });

    test('빈 문자열로 정규화되는 값은 제외한다', () => {
        expect(dedupeEmails(['a@a.com', null, 123, '   '])).toEqual(['a@a.com']);
    });

    test('배열이 아니면 빈 배열을 반환한다', () => {
        expect(dedupeEmails(null)).toEqual([]);
    });
});
