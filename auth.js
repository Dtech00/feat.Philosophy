// 구글 로그인 + 사용자 정보(어떤 채널을 운영하는지) 저장.
// LOGIN_GATE(firebase-config.js)가 'app'이면 로그인과 최초 1회 가입 정보 입력을 마쳐야 편집기가 보이고,
// 'save'면 편집은 누구나 하고 저장(내보내기)할 때만 요구한다.
// app.js는 window.subfxAuth.ensure()가 true를 돌려줄 때만 저장을 진행한다.
// index.html은 <html class="auth-wait">로 시작해 편집기를 가려 두고, 여기서 통과시킬 때 reveal()로 연다.
import * as cfg from './firebase-config.js';

const { firebaseConfig, CONSENT_VERSION } = cfg;
const GATE = cfg.LOGIN_GATE === 'app' ? 'app' : 'save';
window.subfxAuthStarting = true;
const reveal = () => document.documentElement.classList.remove('auth-wait');

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const G_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"/></svg>';
const PLATFORMS = [
  ['youtube', '유튜브'], ['instagram', '인스타그램'], ['tiktok', '틱톡'], ['chzzk', '치지직'],
  ['afreeca', 'SOOP(아프리카TV)'], ['naver', '네이버 클립·블로그'], ['other', '기타']
];

function toast(msg, ms) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; clearTimeout(toast.t); toast.t = setTimeout(() => t.remove(), ms || 2400);
}

// 설정값이 비어 있거나 파일로 직접 연 경우(file://, 구글 로그인 불가)는 로그인 없이 동작
if (!firebaseConfig.apiKey || location.protocol === 'file:') {
  window.subfxAuth = { enabled: false, ensure: async () => true };
  reveal();
} else {
  try { await start(); }
  catch (err) {
    // SDK를 받지 못하면(네트워크 차단 등) 앱을 잠그지 않는다
    console.warn('[subfx] 로그인 기능을 불러오지 못했습니다', err);
    window.subfxAuth = { enabled: false, ensure: async () => true };
    reveal();
  }
}

async function start() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  auth.languageCode = 'ko';
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let user = null, profile = null, touched = false, revealed = false, signupOpen = false;
  if (GATE === 'save') { reveal(); revealed = true; }
  const ref = uid => F.doc(db, 'users', uid);

  async function loadProfile() {
    if (!user) return (profile = null);
    const snap = await F.getDoc(ref(user.uid));
    profile = snap.exists() ? snap.data() : null;
    if (profile && !touched) {
      touched = true;
      F.updateDoc(ref(user.uid), {
        email: user.email || '', displayName: (user.displayName || '').slice(0, 100), lastLoginAt: F.serverTimestamp()
      }).catch(e => console.warn('[subfx] 마지막 접속 시간 기록 실패', e));
    }
    return profile;
  }

  /* ---------- 헤더 표시 ---------- */
  function renderSlot() {
    const slot = $('#authSlot'); if (!slot) return;
    if (!user) slot.innerHTML = `<button class="btn ghost" id="bLogin">${G_ICON}구글 로그인</button>`;
    else slot.innerHTML = `<button class="btn ghost acct" id="bAcct" title="${esc(user.email)}">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<span>${esc(profile ? profile.channelName : '가입 정보 입력')}</span></button>`;
    const bl = $('#bLogin'); if (bl) bl.onclick = () => ensure();
    const ba = $('#bAcct'); if (ba) ba.onclick = () => (profile ? openAccount() : ensure());
  }

  /* ---------- 대화상자 ---------- */
  function dialog(html, label) {
    const root = document.createElement('div');
    root.className = 'modal auth-modal';
    root.innerHTML = `<div class="dlg auth-dlg" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</div>`;
    document.body.appendChild(root);
    return root;
  }

  // 로그인 → (처음이면) 가입 정보 입력. 끝까지 마치면 true, 닫으면 false.
  async function ensure() {
    if (user && profile) return true;
    if (!user) { const ok = await loginDialog(); if (!ok) return false; }
    try { await loadProfile(); }
    catch (e) { console.error(e); toast('사용자 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요', 4000); return false; }
    renderSlot();
    if (profile) return true;
    const ok = await profileDialog(null);
    renderSlot();
    return ok;
  }

  function loginDialog() {
    return new Promise(resolve => {
      const m = dialog(`
        <header><h2>로그인하고 저장하기</h2><button class="btn sm ghost" data-x>닫기</button></header>
        <div></div>
        <div class="body auth-body">
          <p>편집은 로그인 없이 쓸 수 있고, <b>저장할 때만</b> 구글 계정 로그인이 필요해요.</p>
          <p class="muted">처음 한 번만 운영 중인 채널 이름을 받아요. 받는 정보와 보관 기간은 <a href="privacy.html" target="_blank" rel="noopener">개인정보 처리방침</a>에 있어요.</p>
          <button class="btn primary gbtn" data-go>${G_ICON}Google 계정으로 계속하기</button>
          <p class="err" data-err hidden></p>
        </div>`, '로그인');
      const done = v => { m.remove(); resolve(v); };
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) done(false); });
      m.querySelector('[data-go]').onclick = async e => {
        const btn = e.currentTarget; btn.disabled = true;
        try { const r = await A.signInWithPopup(auth, provider); user = r.user; done(true); }
        catch (err) {
          btn.disabled = false;
          if (err && (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request')) return;
          const el = m.querySelector('[data-err]'); el.hidden = false;
          el.textContent = err && err.code === 'auth/popup-blocked' ? '팝업이 차단됐어요. 주소창의 팝업 차단을 풀고 다시 눌러 주세요.'
            : err && err.code === 'auth/unauthorized-domain' ? '이 주소는 로그인 허용 도메인에 없어요. 운영자가 Firebase 콘솔에서 도메인을 추가해야 해요.'
            : '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.';
          console.error(err);
        }
      };
      m.querySelector('[data-go]').focus();
    });
  }

  // prev가 있으면 수정, 없으면 최초 가입
  function profileDialog(prev, required) {
    return new Promise(resolve => {
      const first = !prev;
      const p = prev || { channelName: '', channelUrl: '', platform: '' };
      const m = dialog(`
        <header><h2>${first ? '처음 한 번만 알려 주세요' : '내 정보'}</h2><button class="btn sm ghost" data-x>${required ? '로그아웃' : first ? '나중에' : '닫기'}</button></header>
        <div></div>
        <form class="body auth-body" novalidate>
          <div class="who">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<div><b>${esc(user.displayName || '')}</b><span>${esc(user.email || '')}</span></div></div>
          <label class="fld"><span>운영 중인 채널 이름 <em>필수</em></span><input name="channelName" maxlength="100" required value="${esc(p.channelName)}" placeholder="예: 동테크"></label>
          <label class="fld"><span>플랫폼 <em class="opt">선택</em></span><select name="platform"><option value="">고르지 않음</option>${PLATFORMS.map(([v, t]) => `<option value="${v}"${p.platform === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="fld"><span>채널 주소 <em class="opt">선택</em></span><input name="channelUrl" type="url" maxlength="300" value="${esc(p.channelUrl)}" placeholder="https://www.youtube.com/@..."></label>
          ${first ? `<div class="consent">
            <table><tr><th>받는 정보</th><td>구글 계정 이메일·이름, 채널 이름, (선택) 플랫폼·채널 주소, 동의 시각</td></tr>
            <tr><th>쓰는 곳</th><td>서비스 이용자 파악, 공지·업데이트 안내</td></tr>
            <tr><th>보관 기간</th><td>탈퇴할 때까지. 탈퇴하면 바로 지워요</td></tr></table>
            <p>동의하지 않을 수 있지만, 그 경우 ${GATE === 'app' ? '앱을 쓸 수 없어요' : '저장 기능은 쓸 수 없어요(편집은 그대로 가능)'}. 자세한 내용은 <a href="privacy.html" target="_blank" rel="noopener">개인정보 처리방침</a>에 있어요.</p>
            <label class="chk"><input type="checkbox" name="agree" required> 개인정보 수집·이용에 동의합니다 <em>필수</em></label>
          </div>` : ''}
          <p class="err" data-err hidden></p>
          <div class="acts"><button class="btn primary" type="submit">${first ? (GATE === 'app' ? '가입하고 시작하기' : '가입하고 저장하기') : '저장'}</button></div>
        </form>`, first ? '가입 정보 입력' : '내 정보');
      const done = v => { m.remove(); resolve(v); };
      m.addEventListener('click', e => { if ((e.target === m && !required) || e.target.closest('[data-x]')) done(false); });
      const f = m.querySelector('form');
      const err = t => { const el = m.querySelector('[data-err]'); el.hidden = !t; el.textContent = t || ''; };
      f.channelName.focus();
      f.onsubmit = async e => {
        e.preventDefault();
        const channelName = f.channelName.value.trim(), channelUrl = f.channelUrl.value.trim(), platform = f.platform.value;
        if (!channelName) { f.channelName.focus(); return err('채널 이름을 적어 주세요.'); }
        if (channelUrl && !/^https?:\/\/\S+$/i.test(channelUrl)) { f.channelUrl.focus(); return err('채널 주소는 https://로 시작하는 주소로 적어 주세요.'); }
        if (first && !f.agree.checked) return err(GATE === 'app' ? '개인정보 수집·이용에 동의해야 시작할 수 있어요.' : '개인정보 수집·이용에 동의해야 저장할 수 있어요.');
        err(''); const sb = f.querySelector('[type=submit]'); sb.disabled = true;
        const base = { uid: user.uid, email: user.email || '', displayName: (user.displayName || '').slice(0, 100), channelName, channelUrl, platform, lastLoginAt: F.serverTimestamp() };
        try {
          if (first) {
            const now = F.serverTimestamp();
            await F.setDoc(ref(user.uid), { ...base, consentVersion: CONSENT_VERSION, consentAt: now, createdAt: now });
          } else {
            await F.updateDoc(ref(user.uid), base);
          }
          await loadProfile(); touched = true;
          toast(first ? '가입했어요' : '저장했어요');
          done(true);
        } catch (e2) { console.error(e2); sb.disabled = false; err('저장하지 못했어요. 잠시 후 다시 시도해 주세요.'); }
      };
    });
  }

  function openAccount() {
    const m = dialog(`
      <header><h2>내 계정</h2><button class="btn sm ghost" data-x>닫기</button></header>
      <div></div>
      <div class="body auth-body">
        <div class="who">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<div><b>${esc(user.displayName || '')}</b><span>${esc(user.email || '')}</span></div></div>
        <dl class="kv"><dt>채널</dt><dd>${esc(profile.channelName)}</dd>
        <dt>플랫폼</dt><dd>${esc((PLATFORMS.find(x => x[0] === profile.platform) || [, '-'])[1])}</dd>
        <dt>주소</dt><dd>${profile.channelUrl ? `<a href="${esc(profile.channelUrl)}" target="_blank" rel="noopener noreferrer">${esc(profile.channelUrl)}</a>` : '-'}</dd></dl>
        <div class="acts"><button class="btn" data-edit>정보 수정</button><button class="btn" data-out>로그아웃</button><button class="btn ghost danger" data-del>탈퇴하고 정보 지우기</button></div>
        <p class="muted"><a href="privacy.html" target="_blank" rel="noopener">개인정보 처리방침</a></p>
      </div>`, '내 계정');
    const close = () => m.remove();
    m.addEventListener('click', async e => {
      if (e.target === m || e.target.closest('[data-x]')) return close();
      if (e.target.closest('[data-edit]')) { close(); await profileDialog(profile); renderSlot(); }
      else if (e.target.closest('[data-out]')) { close(); await A.signOut(auth); toast('로그아웃했어요'); }
      else if (e.target.closest('[data-del]')) {
        if (!confirm('저장된 내 정보(이메일·채널)를 모두 지우고 탈퇴할까요? 되돌릴 수 없어요.')) return;
        close(); await removeAccount();
      }
    });
  }

  async function removeAccount() {
    try {
      await F.deleteDoc(ref(user.uid));
      try { await A.deleteUser(user); }
      catch (e) {
        if (e && e.code === 'auth/requires-recent-login') { await A.reauthenticateWithPopup(user, provider); await A.deleteUser(auth.currentUser); }
        else throw e;
      }
      toast('탈퇴했어요. 저장된 정보를 모두 지웠어요', 4000);
    } catch (e) {
      console.error(e);
      toast('탈퇴를 마치지 못했어요. 다시 시도하거나 처리방침의 문의처로 연락해 주세요', 5000);
      await A.signOut(auth).catch(() => {});
    }
  }

  /* ---------- 로그인 벽 (GATE === 'app') ---------- */
  function wall(state) {
    const w = $('#authWall'); if (!w) return;
    const card = w.querySelector('.aw-body');
    if (state === 'login') {
      card.innerHTML = `<p>자막 이펙터는 <b>구글 로그인</b> 후 쓸 수 있어요.</p>
        <p class="muted">처음 한 번만 운영 중인 채널 이름을 받아요. 받는 정보: 구글 이메일·이름, 채널 이름, (선택) 플랫폼·채널 주소. 탈퇴하면 바로 지워요.</p>
        <button class="btn primary gbtn" data-go>${G_ICON}Google 계정으로 시작하기</button>
        <p class="err" data-err hidden></p>
        <p class="muted"><a href="privacy.html" target="_blank" rel="noopener">개인정보 처리방침</a></p>`;
      const go = card.querySelector('[data-go]');
      go.onclick = async () => {
        go.disabled = true;
        try { await A.signInWithPopup(auth, provider); }   // 이후 흐름은 onAuthStateChanged가 이어 간다
        catch (err) {
          go.disabled = false;
          if (err && (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request')) return;
          const el = card.querySelector('[data-err]'); el.hidden = false;
          el.textContent = err && err.code === 'auth/popup-blocked' ? '팝업이 차단됐어요. 주소창의 팝업 차단을 풀고 다시 눌러 주세요.'
            : err && err.code === 'auth/unauthorized-domain' ? '이 주소는 로그인 허용 도메인에 없어요. 운영자에게 알려 주세요.'
            : '로그인하지 못했어요. 다시 눌러 주세요.';
          console.error(err);
        }
      };
      go.focus();
    } else if (state === 'error') {
      card.innerHTML = `<p class="err">계정 정보를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.</p>
        <div class="acts"><button class="btn" data-out>로그아웃</button><button class="btn primary" data-retry>다시 시도</button></div>`;
      card.querySelector('[data-retry]').onclick = () => location.reload();
      card.querySelector('[data-out]').onclick = () => A.signOut(auth);
    } else {
      card.innerHTML = `<p class="muted">가입 정보를 입력해 주세요.</p>`;
    }
  }

  async function gateApp(loadFailed) {
    if (user && profile) { reveal(); revealed = true; return; }
    if (revealed) { location.reload(); return; }   // 쓰던 중 로그아웃·탈퇴하면 처음 화면으로
    if (!user) return wall('login');
    if (loadFailed) return wall('error');
    if (signupOpen) return;
    signupOpen = true; wall('signup');
    const ok = await profileDialog(null, true);
    signupOpen = false;
    if (ok) { renderSlot(); reveal(); revealed = true; }
    else await A.signOut(auth);
  }

  A.onAuthStateChanged(auth, async u => {
    user = u; profile = null; touched = false;
    renderSlot();
    let failed = false;
    if (u) { try { await loadProfile(); } catch (e) { console.warn(e); failed = true; } renderSlot(); }
    if (GATE === 'app') gateApp(failed);
  });

  window.subfxAuth = { enabled: true, ensure };
}

