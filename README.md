# cursor-demo

이메일 처리 유틸리티 모듈과 Jest 기반 테스트 환경을 제공하는 데모 프로젝트입니다.

## 설치

```bash
npm install
```

## 테스트

```bash
npm test
```

## 사용 예시

```bash
node src/index.js
```

---

# 릴리스 노트 — v1.0.0

이메일 처리 유틸리티 모듈을 추가하고 테스트 환경(Jest)과 ES Modules 구성을 갖췄습니다.

### ✨ 기능
- 이메일 유틸리티 모듈(`src/email.js`) 추가 (`2b11655`)
  - `extractEmails`: 사용자 배열에서 이메일 값 추출
  - `isValidEmail`: WHATWG 표준 기반 이메일 형식 검증
  - `normalizeEmail`: 공백 제거 및 소문자 정규화
  - `getValidEmails`: 유효한 이메일만 필터링
  - `dedupeEmails`: 정규화 기준 중복 제거(첫 등장 순서 유지)
- 데모 엔트리포인트(`src/index.js`)에서 유틸리티 사용 예시 및 모듈 export 추가 (`2b11655`)

### 🧹 기타
- 프로젝트를 CommonJS에서 ES Modules(`"type": "module"`)로 전환 (`2b11655`)
- Jest 테스트 환경 구성 및 테스트 스크립트 연결, 단위 테스트(`src/email.test.js`) 추가 (`2b11655`)
- `.gitignore` 추가 및 `main` 진입점을 `src/index.js`로 변경 (`2b11655`)
