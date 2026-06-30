# cursor-demo

Cursor 데모 프로젝트 - 이메일 유틸리티 모듈

## 소개

사용자 목록에서 이메일을 추출/검증/정규화/중복 제거하는 순수 함수 모음입니다. ES Modules 기반이며 Jest로 테스트합니다.

## 구조

- `src/email.js` - 이메일 유틸리티 함수 (`extractEmails`, `isValidEmail`, `normalizeEmail`, `getValidEmails`, `dedupeEmails`)
- `src/email.test.js` - Jest 테스트
- `src/index.js` - 사용 예시 실행 스크립트

## 설치

```bash
npm install
```

## 실행

```bash
node src/index.js
```

## 테스트

```bash
npm test
```
