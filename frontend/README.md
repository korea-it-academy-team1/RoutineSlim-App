# RoutineSlim — frontend (앱)

RoutineSlim 의 모바일 앱입니다. 프로젝트 소개는 [저장소 README](../README.md)를 참고하세요.

아래 명령은 모두 이 `frontend` 폴더에서 실행합니다.

## 기술 스택

- Expo SDK 57 / React Native 0.86 / React 19
- TypeScript
- Expo Router

아래 라이브러리는 설치만 되어 있고 아직 코드에서 사용 X

- 상태 관리: Zustand, TanStack Query
- 로컬 DB: expo-sqlite, Drizzle ORM
- 알림: expo-notifications

## 개발 환경

팀원 모두 아래 버전으로 통일

Node.js 24.15.0 (24 LTS)
React Native 0.86은 20.19.4+, 22.13.0+, 24.3.0+ 만 지원

npm 11.x
Node 24에 포함. yarn, pnpm은 사용 X

Git 2.x

Expo Go SDK 57 지원 버전
스토어 최신 버전. 프로젝트 SDK와 다르면 앱이 열리지 않음

VS Code 최신
권장 확장: Expo Tools (프로젝트를 열면 설치 안내가 뜸)

버전 확인:

    node -v
    npm -v

nvm(Windows는 nvm-windows)을 쓰면 프로젝트 폴더의 .nvmrc에 적힌 버전으로
맞출 수 있음

    nvm install 24.15.0
    nvm use 24.15.0

nvm https://github.com/nvm-sh/nvm
nvm-windows https://github.com/coreybutler/nvm-windows

Expo, React Native, TypeScript 등 라이브러리 버전은 package-lock.json으로
고정되어 있어 npm install만 하면 모두 같은 버전이 설치됩니다.
package-lock.json은 지우지 말고 변경되면 함께 커밋해 주세요.

## 시작하기

1. 의존성 설치

   npm install

2. 개발 서버 실행

   npx expo start

3. 휴대폰에 `Expo Go`를 설치하고 터미널에 나온 QR 코드를
   스캔

휴대폰이 PC와 같은 네트워크에 있지 않으면 개발 서버에 접속할 수 없습니다.
휴대폰을 PC와 같은 Wi-Fi에 연결하거나, 터널 모드로 실행하세요.

    npx expo start --tunnel

## 스크립트

npm start : 개발 서버 실행
npm run android : Android 기기/에뮬레이터 실행
npm run ios : iOS 시뮬레이터 실행
npm run web : 웹 브라우저 실행
npm run lint : 린트 검사

## 폴더 구조

src/
app/ : 화면
\_layout.tsx : 공통 레이아웃
index.tsx : 홈 화면
test.tsx : 테스트 페이지
components/ : 공용 컴포넌트
constants/ : 색상, 간격 등 테마 값
hooks/ : 공용 훅
assets/
images/ : 앱 아이콘, 로고 등 이미지

## 참고

앱 아이콘과 스플래시 화면은 Expo Go에서 보이지 않습니다. 개발 빌드나 실제
빌드에서 확인할 수 있습니다.
