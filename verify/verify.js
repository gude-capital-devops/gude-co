(function () {
  'use strict';

  var DATA_URL = '../data/stamped-sets.json';

  function parseCode() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get('n') || params.get('code');
    if (fromQuery) {
      return fromQuery.trim();
    }
    var path = window.location.pathname.replace(/\/+$/, '');
    var segments = path.split('/').filter(Boolean);
    if (segments.length >= 2 && segments[0] === 'verify') {
      return decodeURIComponent(segments.slice(1).join('/')).trim();
    }
    return '';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[1] + '/' + parts[2] + '/' + parts[0];
  }

  function formatLicenses(pe) {
    if (!pe || !pe.licenses) return '—';
    return pe.licenses
      .map(function (l) {
        return l.state + ' ' + l.number;
      })
      .join(' · ');
  }

  function statusMeta(status) {
    var s = (status || '').toLowerCase();
    if (s === 'current') {
      return { label: 'Current', valid: true, tone: 'ok' };
    }
    if (s === 'superseded') {
      return { label: 'Superseded', valid: false, tone: 'warn' };
    }
    if (s === 'void') {
      return { label: 'Void', valid: false, tone: 'bad' };
    }
    return { label: status || 'Unknown', valid: false, tone: 'warn' };
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function row(label, value) {
    var wrap = el('div', 'verify-row');
    wrap.appendChild(el('dt', null, label));
    var dd = el('dd');
    if (typeof value === 'string') {
      dd.textContent = value;
    } else if (value) {
      dd.appendChild(value);
    } else {
      dd.textContent = '—';
    }
    wrap.appendChild(dd);
    return wrap;
  }

  function renderNotFound(root, code) {
    root.innerHTML = '';
    var panel = el('div', 'verify-panel verify-panel--missing');
    panel.appendChild(el('p', 'verify-kicker', 'Stamp verification'));
    panel.appendChild(el('h1', 'verify-title', 'Record not found'));
    var lead = el(
      'p',
      'verify-lead',
      code
        ? 'No stamped set is registered for verification code “' + code + '”. Check the code on the plan sheet or contact Gude.'
        : 'Enter a verification code from your plan set URL, or scan the QR code printed beside the engineer’s stamp.'
    );
    panel.appendChild(lead);
    if (code) {
      panel.appendChild(el('p', 'verify-code-display', code));
    }
    panel.appendChild(el('p', 'verify-help', 'Questions: office@gude.co'));
    root.appendChild(panel);
    document.title = 'Verification not found — Gude';
  }

  function renderRecord(root, record, firm) {
    root.innerHTML = '';
    var meta = statusMeta(record.status);
    var panel = el('div', 'verify-panel');

    panel.appendChild(el('p', 'verify-kicker', 'Stamp verification'));

    var title = el('h1', 'verify-title', meta.valid ? 'Verified stamp record' : 'Stamp record — not current');
    panel.appendChild(title);

    var banner = el('div', 'verify-status verify-status--' + meta.tone);
    banner.setAttribute('role', 'status');
    var bannerTitle = el('strong', null, meta.label);
    banner.appendChild(bannerTitle);
    banner.appendChild(document.createTextNode(
      meta.valid
        ? ' — This verification code matches a record on file with Gude.'
        : ' — This code is on file but the stamped set is no longer current for reliance.'
    ));
    panel.appendChild(banner);

    if (record.sample) {
      var sample = el('p', 'verify-sample-banner');
      sample.textContent = 'Sample record for demonstration only. Not a real sealed plan set.';
      panel.appendChild(sample);
    }

    panel.appendChild(el('p', 'verify-code-display', record.code));

    var dl = el('dl', 'verify-dl');
    dl.appendChild(row('Project', record.projectName));
    dl.appendChild(row('Project address', record.projectAddress));
    dl.appendChild(row('Client', record.client));
    var sheetLine = [record.sheetSetDescription, record.revision].filter(Boolean).join(' · ');
    dl.appendChild(row('Sheet set / description', sheetLine || '—'));
    dl.appendChild(row('Issue date', formatDate(record.issueDate)));
    dl.appendChild(row('Status', record.status));
    dl.appendChild(
      row(
        'Engineer in responsible charge',
        (record.pe && record.pe.name) || 'Phillip Dixon, P.E.'
      )
    );
    dl.appendChild(row('License numbers', formatLicenses(record.pe)));
    dl.appendChild(row('Issuing firm', (firm && firm.name) || 'Gude'));
    panel.appendChild(dl);

    var note = el(
      'p',
      'verify-disclaimer',
      'This page confirms registration of a professional engineering stamp verification code. It is not a substitute for the signed and sealed documents in the plan set. Structural details and calculations on the sheets govern.'
    );
    panel.appendChild(note);

    root.appendChild(panel);
    document.title = 'Verify ' + record.code + ' — Gude';
  }

  function renderError(root) {
    root.innerHTML = '';
    var panel = el('div', 'verify-panel verify-panel--missing');
    panel.appendChild(el('p', 'verify-kicker', 'Stamp verification'));
    panel.appendChild(el('h1', 'verify-title', 'Unable to load records'));
    panel.appendChild(
      el(
        'p',
        'verify-lead',
        'Verification data could not be loaded. Try again later or contact office@gude.co.'
      )
    );
    root.appendChild(panel);
  }

  var code = parseCode();
  var root = document.getElementById('verify-root');
  if (!root) return;

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then(function (data) {
      var sets = data.sets || [];
      var match = sets.find(function (s) {
        return s.code && s.code.toLowerCase() === code.toLowerCase();
      });
      if (!code || !match) {
        renderNotFound(root, code);
        return;
      }
      renderRecord(root, match, data.firm);
    })
    .catch(function () {
      renderError(root);
    });
})();
