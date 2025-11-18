/* Minimal front-end auth + routing using localStorage.
   NOTE: Demo only – not secure for production.
*/
(function(){
  // helpers
  const $ = (s)=> document.querySelector(s);
  const q = (s)=> document.querySelectorAll(s);

  function getUsers(){
    return JSON.parse(localStorage.getItem('promope_users') || '[]');
  }
  function saveUsers(users){ localStorage.setItem('promope_users', JSON.stringify(users)); }
  function setCurrent(user){ localStorage.setItem('promope_current', JSON.stringify(user)); }
  function getCurrent(){ return JSON.parse(localStorage.getItem('promope_current') || 'null'); }
  function logoutAndRedirect(){
    localStorage.removeItem('promope_current');
    window.location = 'index.html';
  }

  // Signup page
  if (document.body.contains($('#signupBtn'))){
    const urlParams = new URLSearchParams(location.search);
    const prefRole = urlParams.get('role');
    const roleSelect = $('#role');
    if(prefRole) roleSelect.value = prefRole;

    function showRoleSections(){
      const role = roleSelect.value;
      document.querySelectorAll('.role-section').forEach(el=>el.classList.add('hidden'));
      if(role === 'influencer') document.getElementById('influencer-fields').classList.remove('hidden');
      else document.getElementById('brand-fields').classList.remove('hidden');
    }
    roleSelect.addEventListener('change', showRoleSections);
    showRoleSections();

    $('#signupBtn').addEventListener('click', ()=>{
      const role = $('#role').value;
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const pass = $('#password').value;
      if(!name || !email || pass.length < 6){ $('#signup-msg').textContent = 'Please complete required fields (password >=6).'; return; }
      const users = getUsers();
      if(users.some(u=>u.email === email)){ $('#signup-msg').textContent = 'Email already registered.'; return; }

      if(role === 'influencer'){
        const whatsapp = $('#whatsapp').value.trim();
        if(!whatsapp){ $('#signup-msg').textContent = 'WhatsApp is required for influencers.'; return; }
        const u = {
          id: 'u'+Date.now(),
          role, name, email, pass,
          whatsapp, category: $('#category').value,
          socials: {
            instagram: $('#instagram').value.trim(),
            youtube: $('#youtube').value.trim(),
            facebook: $('#facebook').value.trim(),
            x: $('#xlink').value.trim(),
            telegram: $('#telegram').value.trim()
          }
        };
        users.push(u);
        saveUsers(users);
        setCurrent(u);
        $('#signup-msg').textContent = 'Signed up. Redirecting...';
        setTimeout(()=> window.location = 'dashboard-influencer.html', 700);
      } else {
        const brandname = $('#brandname').value.trim();
        const contactperson = $('#contactperson').value.trim();
        const brand_whatsapp = $('#brand_whatsapp').value.trim();
        if(!brandname || !contactperson || !brand_whatsapp){ $('#signup-msg').textContent = 'Complete brand fields.'; return; }
        const u = {
          id: 'u'+Date.now(),
          role, name: brandname, brandname, contactperson, email, pass,
          whatsapp: brand_whatsapp, budget: $('#budget').value, message: $('#brand_msg').value
        };
        users.push(u);
        saveUsers(users);
        setCurrent(u);
        $('#signup-msg').textContent = 'Thanks! Redirecting...';
        setTimeout(()=> window.location = 'dashboard-brand.html', 700);
      }
    });
  }

  // Login page
  if (document.body.contains($('#loginBtn'))){
    $('#loginBtn').addEventListener('click', ()=>{
      const email = $('#login-email').value.trim();
      const pass = $('#login-password').value;
      const users = getUsers();
      const u = users.find(x=>x.email === email && x.pass === pass);
      if(!u){ $('#login-msg').textContent = 'Invalid credentials.'; return; }
      setCurrent(u);
      $('#login-msg').textContent = 'Login successful. Redirecting...';
      setTimeout(()=>{
        if(u.role === 'influencer') window.location='dashboard-influencer.html';
        else window.location='dashboard-brand.html';
      },600);
    });
  }

  // Dashboards - load current
  if(location.pathname.includes('dashboard-influencer.html')){
    const cur = getCurrent();
    if(!cur || cur.role !== 'influencer'){ window.location='login.html'; return; }
    $('#influencer-welcome').innerHTML = `<h2>Welcome, ${cur.name}</h2>
      <p class="muted">Category: ${cur.category || '—'} · WhatsApp: ${cur.whatsapp}</p>
      <p><strong>Socials:</strong> ${Object.values(cur.socials || {}).filter(Boolean).join(' • ') || 'No socials added'}</p>`;
    $('#logoutBtn').addEventListener('click', logoutAndRedirect);
  }

  if(location.pathname.includes('dashboard-brand.html')){
    const cur = getCurrent();
    if(!cur || cur.role !== 'brand'){ window.location='login.html'; return; }
    $('#brand-welcome').innerHTML = `<h2>${cur.brandname || cur.name}</h2>
      <p class="muted">Contact: ${cur.contactperson} · WhatsApp: ${cur.whatsapp}</p>
      <p>Budget: ${cur.budget || '—'}</p>`;
    $('#logoutBtn').addEventListener('click', logoutAndRedirect);
  }

  // quick redirect from index if logged in
  if(location.pathname.endsWith('index.html') || location.pathname === '/'){
    const c = getCurrent();
    if(c){
      // small UX: show a small banner, but don't auto-redirect forcibly
      console.log('user logged in', c.email);
    }
  }

})();
