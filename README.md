# RoutineSlim

코리아IT아카데미 1조 팀 프로젝트입니다.

까먹은 정기구독이나 고정비를 등록하여 지출을 줄이게 관리해 주는 앱입니다.

## 폴더 구조

```
RoutineSlim-App/
├─ frontend/   앱 (Expo / React Native / TypeScript) — 실행 방법은 frontend/README.md
├─ backend/    서버 (Spring Boot / Java 17 / Gradle) — 실행 방법은 backend/README.md
└─ design/     Figma 화면 캡처 등 디자인 자료
```

## 시작하기

앱 관련 명령(`npm`, `npx expo` 등)은 모두 `frontend` 폴더에서 실행합니다.

    cd frontend
    npm install
    npx expo start

자세한 개발 환경과 스크립트는 [frontend/README.md](frontend/README.md)를 참고하세요.

서버는 `backend` 폴더에서 실행합니다 (JDK 17 필요, Gradle 은 wrapper 로 자동 설치).

    cd backend
    ./gradlew bootRun        # Windows: gradlew.bat bootRun

자세한 내용과 첫 작업 순서는 [backend/README.md](backend/README.md)를 참고하세요.
