function setTheme(name) {
  document.body.setAttribute("data-theme", name);
  localStorage.setItem("calc-theme", name);
}
(function initTheme() {
  const saved = localStorage.getItem("calc-theme");
  if (saved) {
    document.body.setAttribute("data-theme", saved);
    const picker = document.getElementById("themePicker");
    if (picker) picker.value = saved;
  }
})();

const display = document.getElementById("display");

const append = (val) => (display.value += val);
const clearAll = () => (display.value = "");
const delLast = () => (display.value = display.value.slice(0, -1));

function handlePercent() {
  const expr = display.value;
  if (!expr) return;

  if (!/[+\-*/]/.test(expr)) {
    const n = Number(expr);
    if (!isNaN(n)) display.value = String(n / 100);
    return;
  }

  const m = expr.match(/^(.*?)([+\-*/])(\d*\.?\d*)$/);
  if (!m) return;

  const left = m[1];
  const op = m[2];
  const right = m[3];

  const base = safeEval(left);
  const part = Number(right);
  if (isNaN(base) || isNaN(part)) return;

  const percentValue = (base * part) / 100;
  display.value = `${left}${op}${percentValue}`;
}

function safeEval(expression) {
  try {
    if (/[a-zA-Z]/.test(expression)) return NaN;
    const cleaned = expression.replace(/([+\-*/])\1+/g, "$1");
    return Function(`"use strict"; return (${cleaned})`)();
  } catch {
    return NaN;
  }
}

function calculate() {
  const result = safeEval(display.value);
  if (Number.isFinite(result)) {
    display.value = String(result);
  } else {
    display.value = "";
    alert("Invalid expression");
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const value = btn.getAttribute("data-value");

  if (action === "clear") return clearAll();
  if (action === "del") return delLast();
  if (action === "equals") return calculate();

  if (value === "%") return handlePercent();
  if (value) return append(value);
});

document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (/\d/.test(k)) return append(k);
  if (k === "." ) return append(".");
  if (k === "+" || k === "-" || k === "*" || k === "/") return append(k);
  if (k === "Enter" || k === "=") { e.preventDefault(); return calculate(); }
  if (k === "Backspace") return delLast();
  if (k.toLowerCase() === "c") return clearAll();
  if (k === "%") return handlePercent();
});
