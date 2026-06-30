import { createServer } from 'node:http';
import { createUserStore, createSessionStore, login } from './auth.js';

// 요청 본문 최대 크기(바이트). 과도한 페이로드로 인한 메모리 고갈을 막는다. by sukwon
const MAX_BODY_BYTES = 10 * 1024;

/**
 * 요청 본문을 크기 제한과 함께 읽어 JSON으로 파싱한다.
 * @param {import('node:http').IncomingMessage} req 요청 객체
 * @returns {Promise<object>} 파싱된 JSON 객체
 */
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(new Error('PAYLOAD_TOO_LARGE'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8');
                resolve(raw ? JSON.parse(raw) : {});
            } catch {
                reject(new Error('INVALID_JSON'));
            }
        });
        req.on('error', reject);
    });
}

/**
 * JSON 응답을 전송한다.
 * @param {import('node:http').ServerResponse} res 응답 객체
 * @param {number} status HTTP 상태 코드
 * @param {object} body 응답 본문 객체
 * @returns {void}
 */
function sendJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(payload);
}

/**
 * 로그인 API 서버를 생성한다.
 * @param {object} [deps] 의존성. 미지정 시 인메모리 저장소를 새로 만든다.
 * @param {ReturnType<typeof createUserStore>} [deps.userStore] 사용자 저장소
 * @param {ReturnType<typeof createSessionStore>} [deps.sessionStore] 세션 저장소
 * @returns {import('node:http').Server} HTTP 서버 인스턴스
 */
export function createApp({ userStore = createUserStore(), sessionStore = createSessionStore() } = {}) {
    const server = createServer(async (req, res) => {
        if (req.method === 'POST' && req.url === '/api/login') {
            let body;
            try {
                body = await readJsonBody(req);
            } catch (err) {
                const status = err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
                sendJson(res, status, { error: '잘못된 요청입니다.' });
                return;
            }
            const token = login({ userStore, sessionStore }, body.email, body.password);
            if (!token) {
                // 사용자 열거를 막기 위해 일반화된 메시지를 사용한다. by sukwon
                sendJson(res, 401, { error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
                return;
            }
            sendJson(res, 200, { token });
            return;
        }
        sendJson(res, 404, { error: '찾을 수 없습니다.' });
    });
    return server;
}

/**
 * 환경변수로 시드 사용자를 등록한 사용자 저장소를 만든다.
 * DEMO_USER_EMAIL / DEMO_USER_PASSWORD가 모두 있을 때만 등록한다.
 * @returns {ReturnType<typeof createUserStore>} 사용자 저장소
 */
function buildSeededUserStore() {
    const userStore = createUserStore();
    const email = process.env.DEMO_USER_EMAIL;
    const password = process.env.DEMO_USER_PASSWORD;
    if (email && password) {
        userStore.addUser(email, password);
    }
    return userStore;
}

// 이 파일을 직접 실행할 때만 서버를 기동한다. by sukwon
if (import.meta.url === `file://${process.argv[1]}`) {
    const port = Number(process.env.PORT) || 3000;
    const app = createApp({ userStore: buildSeededUserStore() });
    app.listen(port, () => {
        console.log(`로그인 API 서버가 포트 ${port}에서 실행 중입니다.`);
    });
}
