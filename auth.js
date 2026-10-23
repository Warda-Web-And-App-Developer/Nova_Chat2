/* NOVA CHAT — auth.js : login / sign-up / Google / profile */
(function () {
  'use strict';
  const N = window.Nova, { S, B, $, $$, esc, el, ic, toast, modal } = N;
  let mode = 'login', photoData = '';

  function friendly(err) {
    const c = err && err.code || '';
    const map = {
      'auth/invalid-credential': 'Wrong email or password.', 'auth/wrong-password': 'Wrong email or password.',
      'auth/user-not-found': 'No account found with that email.', 'auth/email-already-in-use': 'That email is already registered. Try logging in.',
      'auth/weak-password': 'Password must be at least 6 characters.', 'auth/invalid-email': 'Please enter a valid email address.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.', 'auth/network-request-failed': 'Network error — check your connection.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console → Authentication.',
      'auth/unauthorized-domain': 'Add this domain in Firebase Console → Authentication → Settings → Authorized domains.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'permission-denied': 'Firestore rules blocked this. Paste the rules from firebase-config.js into your Firebase console.'
    };
    return map[c] || (err && err.message) || 'Something went wrong.';
  }
  N.friendly = friendly;

  N.showAuth = function () {
    const local = B.mode === 'demo';
    const pendingJoin = sessionStorage.getItem('nova_join');
    const bars = [30, 60, 45, 80, 55, 90, 40, 70, 50, 85, 35, 65, 45, 75, 30, 60, 40, 55];
    const logo = `<div class="w-12 h-12 rounded-2xl bg-gold text-black flex items-center justify-center shadow-lg">${ic('chat', 'w-7 h-7')}</div>`;
    $('#app').innerHTML = `
    <div id="authWrap" class="auth-bg relative min-h-[100dvh] overflow-hidden flex items-center justify-center p-4 sm:p-8">
      <span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span>
      <button data-theme-btn class="icon-btn absolute top-4 right-4 z-20 text-white bg-white/15 backdrop-blur" title="Toggle theme">${N.themeIcon()}</button>
      <div class="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.05fr_1fr] rounded-[2rem] overflow-hidden shadow-2xl border border-white/25 pop-in">
        <div class="auth-hero hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
          <div class="flex items-center gap-3 relative">${logo}<span class="text-2xl font-extrabold tracking-tight">Nova Chat</span></div>
          <div class="relative">
            <h1 class="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight">Conversations that feel <span class="text-gold">effortless.</span></h1>
            <p class="mt-4 text-white/85 text-lg max-w-md">Private chats, group invite links, voice notes, polls, stories and calls — all in one beautiful place.</p>
            <div class="mock mt-8">
              <div class="mk in">Are we still on for Friday? 🎉</div>
              <div class="mk out">Yes! Voting in the poll now 📊</div>
              <div class="mk in voice"><span class="mk-play">${ic('play', 'w-3 h-3')}</span><span class="mk-bars">${bars.map(h => `<i style="height:${h}%"></i>`).join('')}</span><span class="text-xs opacity-70">0:12</span></div>
              <div class="mk-react">❤️ 2</div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 text-sm relative">${['Groups', 'Voice notes', 'Polls', 'Stories', 'Calls'].map(t => `<span class="px-3 py-1.5 rounded-full bg-white/15 border border-white/20">${t}</span>`).join('')}</div>
        </div>
        <div class="bg-[var(--panel)] p-6 sm:p-10 flex flex-col justify-center">
          <div class="lg:hidden flex items-center gap-3 mb-6">${logo}<span class="text-2xl font-extrabold tracking-tight">Nova Chat</span></div>
          ${pendingJoin ? '<div class="mb-4 text-sm rounded-xl bg-gold text-black px-3 py-2 font-medium">You were invited to a group. Log in or sign up to join it.</div>' : ''}
          <div id="authHead" class="mb-5"></div>
          <div class="seg-nav mb-5"><button class="tab" data-mode="login">Log in</button><button class="tab" data-mode="signup">Sign up</button></div>
          <form id="authForm" class="space-y-3.5" novalidate></form>
          <div class="flex items-center gap-3 my-5 text-xs text-[var(--muted)]"><div class="flex-1 h-px bg-[var(--border)]"></div>or continue with<div class="flex-1 h-px bg-[var(--border)]"></div></div>
          <button id="googleBtn" class="btn btn-ghost w-full border border-[var(--border)] !py-3">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#6a92b5" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z"/><path fill="#7851A9" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.600-4.100H3.100v2.600A10 10 0 0 0 12 22z"/><path fill="#FFBF00" d="M6.400 14c-.2-.6-.3-1.300-.3-2s.1-1.400.3-2V7.400H3.100a10 10 0 0 0 0 9.200z"/><path fill="#6a92b5" d="M12 5.900c1.500 0 2.800.5 3.800 1.500l2.800-2.800A10 10 0 0 0 3.100 7.400L6.400 10c.8-2.300 3-4.100 5.600-4.100z"/></svg>
            Continue with Google</button>
          <p class="text-xs text-[var(--muted)] text-center mt-4">${local ? 'Local mode — add your Firebase keys in firebase-config.js to go live. Open two tabs to test chatting.' : 'Secured by Firebase Authentication.'}</p>
        </div>
      </div>
    </div>`;
    $$('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; renderForm(); });
    $('#googleBtn').onclick = googleFlow;
    $$('[data-theme-btn]').forEach(b => b.onclick = N.toggleTheme);
    renderForm();
  };

  function renderForm() {
    $$('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    const su = mode === 'signup', f = $('#authForm');
    $('#authHead').innerHTML = `<h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${su ? 'Create your account' : 'Welcome back 👋'}</h2><p class="text-[var(--muted)] mt-1">${su ? 'Join Nova Chat in less than a minute.' : 'Log in to continue your conversations.'}</p>`;
    const row = (id, icon, ph, type, extra = '') => `<div class="inp"><span class="inp-ic">${ic(icon, 'w-5 h-5')}</span><input id="${id}" type="${type}" class="field" placeholder="${ph}" ${extra}></div>`;
    f.innerHTML = `
      ${su ? `<div class="flex items-center gap-4 p-3 rounded-2xl bg-[var(--panel2)]">
        <label class="relative cursor-pointer shrink-0">
          <img id="pfPrev" class="w-16 h-16 rounded-2xl object-cover border-2 border-gold bg-[var(--panel)]" src="${photoData || B.util.avatarSVG('?', 'new')}">
          <span class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-gold text-black flex items-center justify-center shadow">${ic('camera', 'w-4 h-4')}</span>
          <input id="pfFile" type="file" accept="image/*" class="hidden">
        </label>
        <div class="text-sm"><div class="font-semibold">Profile picture</div><div class="text-xs text-[var(--muted)]">Optional — you can change it later</div></div></div>
        ${row('fUser', 'user', 'Username (3–20 letters, numbers, _ .)', 'text', 'autocomplete="username" maxlength="20"')}` : ''}
      ${row('fEmail', 'mail', 'Email address', 'email', 'autocomplete="email"')}
      <div class="inp"><span class="inp-ic">${ic('lock', 'w-5 h-5')}</span><input id="fPass" type="password" class="field !pr-12" placeholder="Password (min 6 characters)" autocomplete="${su ? 'new-password' : 'current-password'}"><button type="button" id="pwToggle" class="pw-eye" title="Show / hide password">${ic('eye', 'w-5 h-5')}</button></div>
      <div id="authErr" class="hidden text-sm rounded-xl px-3 py-2 bg-royal text-white"></div>
      <button class="btn btn-gold w-full !py-3.5 text-base shadow-lg" id="authSubmit">${su ? 'Create account' : 'Log in'} →</button>`;
    $('#pwToggle').onclick = () => { const i = $('#fPass'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; $('#pwToggle').innerHTML = ic(show ? 'eyeoff' : 'eye', 'w-5 h-5'); };
    if (su) $('#pfFile').onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { photoData = await N.avatarFromFile(file); $('#pfPrev').src = photoData; } catch (err) { toast(err.message); }
    };
    f.onsubmit = submit;
  }

  function showErr(msg) { const e = $('#authErr'); if (!e) return; e.textContent = msg; e.classList.remove('hidden'); }

  async function submit(e) {
    e.preventDefault(); const btn = $('#authSubmit'); $('#authErr').classList.add('hidden');
    const email = $('#fEmail').value.trim(), password = $('#fPass').value;
    if (!/^\S+@\S+\.\S+$/.test(email)) return showErr('Please enter a valid email address.');
    if (password.length < 6) return showErr('Password must be at least 6 characters.');
    btn.disabled = true; const old = btn.textContent; btn.textContent = 'Please wait…';
    try {
      if (mode === 'signup') {
        const username = $('#fUser').value.trim();
        if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) { btn.disabled = false; btn.textContent = old; return showErr('Username must be 3–20 characters: letters, numbers, _ or .'); }
        await B.signUp({ email, password, username, photo: photoData });
      } else await B.login(email, password);
    } catch (err) { showErr(friendly(err)); btn.disabled = false; btn.textContent = old; }
  }

  async function googleFlow() {
    if (B.mode === 'firebase') { try { await B.google(); } catch (e) { toast(friendly(e)); } return; }
    const accts = [['Alex Morgan', 'alex.morgan@gmail.com'], ['Sam Rivera', 'sam.rivera@gmail.com']];
    const md = modal(`<div class="p-6"><div class="text-center mb-4"><div class="text-xl font-bold">Choose an account</div><div class="text-sm text-[var(--muted)]">to continue to Nova Chat (simulated Google chooser)</div></div>
      ${accts.map(([n, m]) => `<button class="row rounded-xl" data-g="${m}" data-n="${n}"><img class="w-10 h-10 rounded-full" src="${B.util.avatarSVG(n, m)}"><div><div class="font-semibold">${n}</div><div class="text-sm text-[var(--muted)]">${m}</div></div></button>`).join('')}
      <div class="flex gap-2 mt-3"><input id="gMail" class="field" placeholder="Use another email…" type="email"><button class="btn btn-gold" id="gGo">Go</button></div></div>`);
    const go = async (mail, name) => { try { md.close(); await B.google(mail, name); } catch (e) { toast(friendly(e)); } };
    $$('[data-g]', md.box).forEach(b => b.onclick = () => go(b.dataset.g, b.dataset.n));
    $('#gGo', md.box).onclick = () => { const v = $('#gMail', md.box).value.trim(); if (/^\S+@\S+\.\S+$/.test(v)) go(v, v.split('@')[0]); else toast('Enter a valid email'); };
  }

  /* profile modal — used for first-time setup (Google) and editing */
  N.profileModal = function (user, { first = false } = {}) {
    let photo = user.photo || '';
    const md = modal(`<form class="p-6 space-y-4">
      <h3 class="text-xl font-bold">${first ? 'Set up your profile' : 'Edit profile'}</h3>
      ${first ? '<p class="text-sm text-[var(--muted)]">Pick a username and (optionally) a profile picture so people can find you.</p>' : ''}
      <div class="flex justify-center"><label class="relative cursor-pointer">
        <img id="pmImg" class="w-28 h-28 rounded-full object-cover border-4 border-gold" src="${N.avatar({ ...user, photo })}">
        <span class="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gold text-black flex items-center justify-center shadow">${ic('camera', 'w-5 h-5')}</span>
        <input id="pmFile" type="file" accept="image/*" class="hidden"></label></div>
      <input id="pmName" class="field" placeholder="Username" maxlength="20" value="${esc(user.username || (user.email || '').split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 20))}">
      <div id="pmErr" class="hidden text-sm rounded-xl px-3 py-2 bg-royal text-white"></div>
      <div class="flex gap-2 justify-end">${first ? '' : '<button type="button" class="btn btn-ghost" data-c>Cancel</button>'}<button class="btn btn-royal">Save</button></div></form>`, { sticky: first });
    $('[data-c]', md.box) && ($('[data-c]', md.box).onclick = md.close);
    $('#pmFile', md.box).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { photo = await N.avatarFromFile(f); $('#pmImg', md.box).src = photo; } catch (er) { toast(er.message); } };
    md.box.querySelector('form').onsubmit = async e => {
      e.preventDefault(); const name = $('#pmName', md.box).value.trim(), err = $('#pmErr', md.box);
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(name)) { err.textContent = 'Username must be 3–20 characters: letters, numbers, _ or .'; err.classList.remove('hidden'); return; }
      try {
        if (await B.usernameTaken(name, user.uid)) { err.textContent = 'That username is already taken.'; err.classList.remove('hidden'); return; }
        await B.updateProfile(user.uid, { username: name, usernameLower: name.toLowerCase(), photo, profileDone: true });
        md.close(); toast('Profile saved');
      } catch (er) { err.textContent = friendly(er); err.classList.remove('hidden'); }
    };
  };
})();
