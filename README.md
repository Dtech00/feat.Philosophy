# 자막 이펙터

SRT를 불러와 줄마다 글꼴·색·외곽선·그림자·박스·위치·등장/퇴장 효과를 입히고, **SRT 저장**을 누르면 효과까지 담긴 SRT 하나로 저장하는 브라우저 앱입니다. 그 SRT를 다시 불러오면 효과가 그대로 복원됩니다.

## SRT에 효과가 들어가는 방식
- 보이는 자막 줄(번호, 시간, 글자)은 일반 SRT와 같습니다.
- 효과 정보는 파일 맨 끝 `99:00:00` 지점의 숨은 줄 하나에 압축(gzip+base64)해서 넣습니다. 영상 길이를 넘는 시간이라 다른 프로그램에선 화면에 나오지 않습니다.
- 다른 프로그램(캡컷·프리미어·유튜브 등)은 효과를 읽지 못하고 글자만 씁니다. 일부 편집기는 99시간 지점의 줄을 목록에 보여줄 수 있습니다.
- 다른 곳에서 글자를 고쳐도 줄 수가 같으면 효과는 유지되고 고친 글자가 반영됩니다. 줄 수가 바뀌면 글자와 시간만 불러옵니다.
- 효과 정보가 없는 일반 SRT도 그대로 열립니다. 설치·서버 없이 `subtitle-fx.html`을 크롬이나 엣지로 열면 됩니다 (Google Fonts를 받기 위해 인터넷 연결 필요, Pretendard는 파일에 내장).

## 다른 형식 (상단 '다른 형식' 버튼)
| 형식 | 담기는 것 | 쓰는 곳 |
|---|---|---|
| ASS (추천) | 글꼴, 크기, 색, 외곽선, 그림자, 박스, 위치, 회전, 모든 효과 | VLC·mpv·팟플레이어, Aegisub, ffmpeg 번인 |
| SRT (기본) | 글자·시간 + 숨은 효과 정보. 옵션으로 색·굵기·`{\anN}` 위치 태그 | 이 앱 재편집, 모든 자막 도구 |
| JSON | 편집 상태 전체 + 내 프리셋 | 이 앱에서 다시 열기 |

영상에 입히기: `ffmpeg -i 원본.mp4 -vf "ass=자막.ass:fontsdir=./fonts" -c:a copy 결과.mp4`
ASS는 글꼴을 포함하지 않으므로 같은 글꼴이 설치돼 있거나 `fontsdir`에 있어야 합니다.

## 효과
- 등장: 페이드, 팝, 줌 아웃, 4방향 슬라이드, 블러 인, 타자기, 글자 순차 페이드
- 퇴장: 페이드, 커지며/작아지며 사라짐, 블러 아웃, 위/아래로 빠지기
- 유지 중: 노래방(색 채우기)
- 스타일: `*별표*`로 감싼 부분 강조 색, 글로우(번짐), 배경 박스
- 제약: ASS는 한 줄에 이동(\move)을 한 번만 지원 → 슬라이드 인+슬라이드 아웃 조합은 아웃이 페이드로 바뀜. 박스(BorderStyle 3)와 외곽선은 동시 사용 불가.

## 글꼴 (모두 SIL Open Font License 1.1)
상업 영상 사용 가능, 폰트 파일 단독 판매 금지. 출처: Pretendard는 github.com/orioncactus/pretendard, 나머지는 Google Fonts.
- 고딕: Pretendard, Noto Sans KR, Gothic A1, IBM Plex Sans KR, Nanum Gothic, Gowun Dodum
- 명조: Noto Serif KR, Nanum Myeongjo, Gowun Batang, Hahmlet, Song Myung
- 제목: Black Han Sans, Do Hyeon, Jua, Gugi, Bagel Fat One, Gasoek One, Orbit, Dongle
- 손글씨: Nanum Pen Script, Nanum Brush Script, Gaegu, Hi Melody, Gamja Flower, Poor Story, East Sea Dokdo, Dokdo
- 개성: Single Day, Cute Font, Yeon Sung, Stylish, Diphylleia
- 내 폰트 파일(.ttf/.otf/.woff) 추가 가능

## 구글 로그인과 사용자 정보 (Firebase)
접속하면 먼저 로그인 화면이 나오고, 구글 로그인과 최초 1회 가입 정보 입력을 마쳐야 편집기가 열립니다. 가입 정보는 채널 이름(필수), 플랫폼·채널 주소(선택), 개인정보 수집 동의(필수)입니다. `privacy.html`은 로그인 없이 열립니다.

`firebase-config.js`의 `LOGIN_GATE`로 바꿀 수 있습니다.
| 값 | 동작 | 장단점 |
|---|---|---|
| `'app'` (현재) | 접속하면 바로 로그인 | 가입자가 가장 많이 모임. 대신 처음 온 사람이 써 보기 전에 나갈 수 있음 |
| `'save'` | 편집은 자유, 저장할 때만 로그인 | 이탈이 적음. 대신 편집만 하고 나가는 사람은 명단에 안 잡힘 |

저장되는 곳: Firestore `users/{uid}` 문서 하나
| 필드 | 내용 |
|---|---|
| `uid`, `email`, `displayName` | 구글 계정 기본 정보 |
| `channelName`, `platform`, `channelUrl` | 운영 중인 채널 (플랫폼·주소는 빈 값 가능) |
| `consentVersion`, `consentAt` | 동의한 처리방침 버전과 시각 |
| `createdAt`, `lastLoginAt` | 가입 시각, 마지막 접속 시각 |

관련 파일: `auth.js`(로그인·가입 화면), `firebase-config.js`(설정값), `firestore.rules`(접근 규칙), `privacy.html`(개인정보 처리방침).
`firebase-config.js`의 `apiKey`가 비어 있거나, 파일로 직접 열었거나(`file://`), Firebase SDK를 받지 못하면 로그인 기능이 꺼지고 누구나 쓸 수 있게 열립니다. 사이트가 통째로 잠기는 일을 막기 위한 장치입니다.

현재 연결할 Firebase 프로젝트: `feat-philosophy` (Firestore 위치 `asia-northeast3` 서울, 승인된 도메인 `grand-malasada-773d11.netlify.app`). 콘솔 쪽 1~5번은 완료됐습니다. 새 프로젝트로 옮기거나 도메인을 바꿀 때 아래 순서를 다시 따릅니다.

### Firebase 콘솔에서 할 일 (처음 한 번)
1. [console.firebase.google.com](https://console.firebase.google.com) → **프로젝트 추가** → 이름 입력 (Google 애널리틱스는 꺼도 됩니다).
2. **Build → Authentication → 시작하기 → Sign-in method → Google → 사용 설정** → 프로젝트 지원 이메일 선택 → 저장.
3. **Authentication → Settings → 승인된 도메인 → 도메인 추가** → Netlify 주소(예: `내사이트.netlify.app`)를 넣습니다. 커스텀 도메인을 쓰면 그 도메인도 추가합니다. `localhost`는 기본으로 들어 있습니다.
4. **Build → Firestore Database → 데이터베이스 만들기** → 위치는 `asia-northeast3 (서울)` 추천(나중에 못 바꿈) → **프로덕션 모드**로 시작.
5. Firestore → **규칙** 탭 → 내용을 모두 지우고 이 저장소의 `firestore.rules` 내용을 붙여 넣은 뒤 **게시**.
6. **프로젝트 설정(톱니바퀴) → 일반 → 내 앱 → 웹(`</>`) 앱 추가** → 앱 이름 입력 (Hosting 체크는 하지 않음) → 화면에 나오는 `firebaseConfig`의 6개 값을 `firebase-config.js`에 붙여 넣고 커밋합니다.
7. `privacy.html`의 운영자 이름과 문의 이메일을 확인합니다.

`firebase-config.js`의 값은 원래 공개되는 웹 설정이라 저장소에 올려도 됩니다. 데이터 보호는 5번의 규칙이 맡습니다. **서비스 계정 키(.json)는 절대 저장소에 넣지 마세요.**

### 가입자 보기 (`admin.html`)
`사이트주소/admin.html`을 열고 관리자 구글 계정으로 로그인하면 가입자 목록(가입일, 마지막 접속, 채널, 플랫폼, 채널 주소, 이름, 이메일)이 나옵니다. 열 제목을 누르면 정렬되고, 검색과 **CSV 받기**(엑셀에서 한글이 깨지지 않는 UTF-8)가 됩니다. 앱 화면에는 이 페이지로 가는 링크가 없고 검색엔진 노출도 막혀 있습니다.

관리자 지정은 두 곳을 같은 이메일로 맞춥니다.
1. `firestore.rules`의 `adminEmails()` 목록 (실제 권한). 고친 뒤 Firebase 콘솔 → Firestore → **규칙**에 붙여 넣고 **게시**해야 적용됩니다.
2. `admin.html`의 `ADMIN_EMAILS` (화면 안내용).

관리자는 목록을 읽기만 할 수 있고 남의 정보를 고치거나 지울 수는 없습니다. Firestore 콘솔의 **데이터** 탭에서도 볼 수 있습니다.

### 알아둘 점
- 로그인 확인은 브라우저에서 하므로 개발자 도구로 우회할 수 있습니다. 이 기능은 **사용자 명단 수집용**이지 유료 기능 잠금 같은 보안 장치가 아닙니다.
- Netlify 배포 미리보기 주소(`deploy-preview-N--...netlify.app`)는 승인된 도메인이 아니라서 로그인 팝업이 실패합니다. 미리보기에서도 시험하려면 그 주소를 3번처럼 추가합니다.
- 규칙을 CLI로 올리려면 `npx firebase-tools deploy --only firestore:rules --project <프로젝트ID>` (`firebase.json` 포함).

## 단축키
Space 재생/정지 · ↑↓ 줄 이동 (Shift로 범위 선택) · Ctrl+Z 되돌리기 · Delete 선택 줄 삭제

## 개발
빌드 과정 없이 정적 파일만으로 동작합니다. `index.html`을 브라우저로 열거나 `python3 -m http.server`로 띄우면 됩니다.

## Netlify 배포
1. Netlify에서 **Add new site → Import an existing project → GitHub** 를 고르고 이 저장소를 연결합니다.
2. 빌드 설정은 `netlify.toml`에 들어 있어 따로 입력할 것이 없습니다 (Build command 비움, Publish directory `.`).
3. **Deploy** 를 누르면 끝입니다. 이후 main에 올라가는 변경은 자동으로 다시 배포됩니다.
