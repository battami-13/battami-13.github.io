// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
revealEls.forEach(el => observer.observe(el));

// ── "GET IN TOUCH" SMOOTH SCROLL ──
function scrollToContact(e) {
  e.preventDefault();
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

// ── SUPABASE CONTACT FORM ──
const SUPABASE_URL = 'https://mrnpnmfffwrkcfwjkskm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybnBubWZmZndya2Nmd2prc2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDkxNTYsImV4cCI6MjA4ODYyNTE1Nn0.L_4UTUPgDHRZX2hSSLDORcKbZO9sUGBSeycCkFU9JP4';

async function submitContact() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  const btn     = document.getElementById('cf-btn');
  const success = document.getElementById('form-success');
  const error   = document.getElementById('form-error');

  success.className = 'form-msg';
  error.className   = 'form-msg';

  if (!name || !email || !message) {
    error.textContent = 'Please fill in all fields.';
    error.className   = 'form-msg error';
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled    = true;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({ name, email, message })
    });

    if (res.ok) {
      success.textContent = "✓ Message sent! I'll get back to you soon.";
      success.className   = 'form-msg success';
      document.getElementById('cf-name').value    = '';
      document.getElementById('cf-email').value   = '';
      document.getElementById('cf-message').value = '';
    } else {
      let errBody = '';
      try { errBody = await res.text(); } catch(_) {}
      const status = res.status;

      if (status === 404) {
        error.innerHTML = `Table not found (404). In your <a href="https://supabase.com/dashboard" target="_blank" style="color:#dc2626;text-decoration:underline">Supabase dashboard</a>, go to <strong>SQL Editor</strong> and run:<br><br>
          <code style="font-size:0.78rem;background:#fff0f0;padding:6px 8px;border-radius:6px;display:block;margin-top:4px">
          CREATE TABLE contact_messages (<br>
          &nbsp;&nbsp;id bigserial PRIMARY KEY,<br>
          &nbsp;&nbsp;name text NOT NULL,<br>
          &nbsp;&nbsp;email text NOT NULL,<br>
          &nbsp;&nbsp;message text NOT NULL,<br>
          &nbsp;&nbsp;created_at timestamptz DEFAULT now()<br>
          );<br><br>
          ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;<br>
          CREATE POLICY "allow_insert" ON contact_messages FOR INSERT WITH CHECK (true);
          </code>`;
        error.className = 'form-msg error';
      } else if (status === 401 || status === 403) {
        error.textContent = `Permission denied (${status}). Make sure Row Level Security allows anon inserts.`;
        error.className   = 'form-msg error';
      } else {
        error.textContent = `Error ${status}: ${errBody || 'Something went wrong. Please email me directly at hoichailau@gmail.com'}`;
        error.className   = 'form-msg error';
      }
    }
  } catch (err) {
    error.textContent = 'Network error — please check your connection or email me at hoichailau@gmail.com';
    error.className   = 'form-msg error';
  }

  btn.textContent = 'Send message';
  btn.disabled    = false;
}
