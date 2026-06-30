import { extractEmails, isValidEmail, normalizeEmail, getValidEmails, dedupeEmails } from './email.js';

const users = [
    { name: 'Alice', email: 'Alice@Example.com ' },
    { name: 'Bob', email: 'not-an-email' },
    { name: 'Carol', email: 'carol@test.org' },
];

console.log('전체 이메일:', extractEmails(users));
console.log('정규화된 이메일:', extractEmails(users).map(normalizeEmail));
console.log('유효한 이메일:', getValidEmails(users));

export { extractEmails, isValidEmail, normalizeEmail, getValidEmails, dedupeEmails };
