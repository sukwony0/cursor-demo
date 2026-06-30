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

# 릴리스 노트 — v1.1.0

이메일/비밀번호 인증 모듈과 로그인 HTTP API를 추가하고, 이메일 검증을 RFC 5322 권장 정규식으로 강화했습니다.

### ✨ 기능
- 인증 모듈(`src/auth.js`) 추가 (`e8da2eb`)
  - `hashPassword` / `verifyPassword`: scrypt 기반 해싱과 타이밍 안전 비교
  - `createUserStore` / `createSessionStore`: 인메모리 사용자·세션 저장소
  - `login`: 세션 토큰 발급(사용자 열거 방지 포함)
- 로그인 API 서버(`src/server.js`) 추가 (`e8da2eb`)
  - `POST /api/login` 엔드포인트, 요청 본문 크기 제한(10KB), 일반화된 오류 응답

### 🐛 버그 수정 / 개선
- 이메일 검증 강화(`src/email.js`): `isValidEmail`을 RFC 5322 권장(preferred) 정규식으로 교체. 선행/연속/후행 점 거부, 도메인 TLD 강제 (`e8da2eb`)
- release-notes 스킬 파일명을 `skill.md` → `SKILL.md`로 정정해 스킬이 정상 등록되도록 함 (`a0d0471`)

### 🧹 기타
- 인증 모듈 테스트(`src/auth.test.js`) 추가 (`e8da2eb`)
- 셸 감사 로깅 및 `rm -rf` 차단 훅(`.cursor/hooks/`) 추가 (`e8da2eb`)
- 보안 감사 서브에이전트(`.cursor/agents/security-auditor.md`) 추가 (`e8da2eb`)
- 공통 코딩 규칙(`.cursor/rules/coding-style.mdc`) 정리 (`e8da2eb`)
- Cursor 커맨드 및 release-notes 스킬 추가 (`b18439d`)

---

# 릴리스 노트 — v1.0.0

이메일 처리 유틸리티 모듈을 추가하고 테스트 환경(Jest)과 ES Modules 구성을 갖추었습니다.

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
