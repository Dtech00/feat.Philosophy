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

## 단축키
Space 재생/정지 · ↑↓ 줄 이동 (Shift로 범위 선택) · Ctrl+Z 되돌리기 · Delete 선택 줄 삭제

## 개발
빌드 과정 없이 정적 파일만으로 동작합니다. `index.html`을 브라우저로 열거나 `python3 -m http.server`로 띄우면 됩니다.

## Netlify 배포
1. Netlify에서 **Add new site → Import an existing project → GitHub** 를 고르고 이 저장소를 연결합니다.
2. 빌드 설정은 `netlify.toml`에 들어 있어 따로 입력할 것이 없습니다 (Build command 비움, Publish directory `.`).
3. **Deploy** 를 누르면 끝입니다. 이후 main에 올라가는 변경은 자동으로 다시 배포됩니다.
