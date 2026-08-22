(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/office@gude.co";
  var forms = document.querySelectorAll("[data-intake]");

  for (var i = 0; i < forms.length; i++) {
    setup(forms[i]);
  }

  function setup(form) {
    var confirmEl = form.querySelector("[data-intake-confirm]");
    var selectAll = form.querySelector("[data-intake-select-all]");
    var checks = form.querySelectorAll("[data-intake-check]");
    var submitBtn = form.querySelector("[type=submit]");

    function syncSelectAll() {
      if (!selectAll || !checks.length) return;
      var allOn = true;
      var anyOn = false;
      for (var c = 0; c < checks.length; c++) {
        if (checks[c].checked) anyOn = true;
        else allOn = false;
      }
      selectAll.checked = allOn;
      selectAll.indeterminate = anyOn && !allOn;
    }

    if (selectAll) {
      selectAll.addEventListener("change", function () {
        for (var c = 0; c < checks.length; c++) {
          checks[c].checked = selectAll.checked;
        }
        selectAll.indeterminate = false;
      });
    }
    for (var c = 0; c < checks.length; c++) {
      checks[c].addEventListener("change", syncSelectAll);
    }

    function showStatus(text, isError) {
      if (!confirmEl) return;
      confirmEl.textContent = text;
      confirmEl.style.display = "block";
      confirmEl.classList.toggle("is-error", !!isError);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (form.querySelector("[name=_gotcha]") && form.querySelector("[name=_gotcha]").value) {
        showStatus("Submitted. We will reply if a next step is needed.", false);
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (checks.length) {
        var picked = false;
        for (var p = 0; p < checks.length; p++) {
          if (checks[p].checked) picked = true;
        }
        if (!picked) {
          showStatus("Select at least one item that applies to this request.", true);
          return;
        }
      }

      var payload = {
        _subject: form.getAttribute("data-intake-subject") || "Website intake",
        _template: "table",
        _captcha: false,
        lane: form.getAttribute("data-intake") || ""
      };
      var fields = form.querySelectorAll("input, textarea, select");
      var scopes = [];
      for (var f = 0; f < fields.length; f++) {
        var el = fields[f];
        if (!el.name || el.name === "_gotcha") continue;
        if (el.type === "checkbox") {
          if (el.checked) scopes.push(el.value);
          continue;
        }
        if (el.type === "radio" && !el.checked) continue;
        payload[el.name] = el.value.trim();
      }
      if (scopes.length) payload.scope = scopes.join("; ");

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
      }
      showStatus("Sending…", false);

      fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok && result.data && result.data.success !== "false") {
            form.reset();
            syncSelectAll();
            showStatus("Received. We will reply if a next step is needed.", false);
            return;
          }
          throw new Error((result.data && result.data.message) || "Send failed");
        })
        .catch(function () {
          showStatus("The form could not be sent. Try again, or write office@gude.co if it keeps failing.", true);
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
          }
        });
    });
  }
})();
