// Firebase 웹 앱 설정값. Firebase 콘솔 → 프로젝트 설정 → 일반 → 내 앱 → SDK 설정 및 구성 → "구성"에 나오는 값을 그대로 붙여 넣습니다.
// 이 값들은 공개되어도 되는 웹 설정입니다(접근 제어는 firestore.rules가 담당). 서비스 계정 키(.json)나 비밀 값은 절대 여기에 넣지 마세요.
// apiKey가 비어 있으면 로그인 기능이 꺼지고 앱은 예전처럼 로그인 없이 동작합니다.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

// 개인정보 처리방침 문구가 바뀌면 숫자를 올립니다. 동의 기록에 함께 저장됩니다.
export const CONSENT_VERSION = '2026-10-02';
