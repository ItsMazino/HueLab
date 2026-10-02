import {
  presets,
  contrast,
  ink,
  validHex,
  generateColors,
  cssExport,
} from "./color.js";

const $ = (selector) => document.querySelector(selector);
let colors = [...presets[0].colors],
  locks = Array(5).fill(false),
  name = presets[0].name,
  history = [],
  saved = [];
try {
  const stored = JSON.parse(localStorage.getItem("huelab-v1"));
  if (Array.isArray(stored))
    saved = stored
      .filter(
        (p) =>
          typeof p.name === "string" &&
          Array.isArray(p.colors) &&
          p.colors.length === 5 &&
          p.colors.every(validHex),
      )
      .slice(0, 30);
} catch {}
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2800);
}
function remember() {
  history.push({ colors: [...colors], name });
  if (history.length > 40) history.shift();
}
function setPalette(palette) {
  remember();
  colors = [...palette.colors];
  name = palette.name;
  locks.fill(false);
  render();
}
function contrastView() {
  const fg = colors[Number($("#foreground").value)],
    bg = colors[Number($("#background").value)];
  const ratio = contrast(fg, bg);
  $("#contrast-sample").style.cssText = `color:${fg};background:${bg}`;
  $("#ratio").innerHTML = `${ratio.toFixed(2)}<span>:1</span>`;
  $("#aa").textContent = `${ratio >= 4.5 ? "✓" : "×"} AA normal text`;
  $("#aaa").textContent = `${ratio >= 7 ? "✓" : "×"} AAA normal text`;
  $("#aa").className = ratio >= 4.5 ? "pass" : "fail";
  $("#aaa").className = ratio >= 7 ? "pass" : "fail";
}
function render() {
  $("#palette-name").textContent = name;
  $("#undo").disabled = !history.length;
  $("#swatches").replaceChildren(
    ...colors.map((color, i) => {
      const panel = document.createElement("div");
      panel.className = "swatch";
      panel.style.cssText = `background:${color};color:${ink(color)}`;
      panel.innerHTML = `<div class="swatch-top"><span>0${i + 1}</span><button class="lock" aria-label="${locks[i] ? "Unlock" : "Lock"} color ${i + 1}" aria-pressed="${locks[i]}">${locks[i] ? "◆" : "◇"}</button></div><div class="swatch-bottom"><label class="color-picker" title="Choose color ${i + 1}">Edit color<input type="color" aria-label="Choose color ${i + 1}" value="${color}"></label><input class="hex" aria-label="Hex color ${i + 1}" value="${color}" maxlength="7" spellcheck="false"><span class="swatch-caption">${locks[i] ? "LOCKED" : "CLICK TO EDIT"}</span></div>`;
      panel.querySelector(".lock").onclick = () => {
        locks[i] = !locks[i];
        render();
        $(`.swatch:nth-child(${i + 1}) .lock`).focus();
      };
      const edit = (value) => {
        if (!validHex(value)) {
          toast("Use a hex color like #A4B494.");
          render();
          return;
        }
        remember();
        colors[i] = value.toUpperCase();
        name = "Your color study";
        render();
      };
      panel.querySelector(".hex").onchange = (event) =>
        edit(event.target.value);
      panel.querySelector("[type=color]").onchange = (event) =>
        edit(event.target.value);
      return panel;
    }),
  );
  ["foreground", "background"].forEach((id, index) => {
    const select = $(`#${id}`),
      chosen = select.value || (index ? "2" : "0");
    select.replaceChildren(
      ...colors.map((color, i) => new Option(`${i + 1} · ${color}`, String(i))),
    );
    select.value = chosen;
  });
  colors.forEach((color, i) =>
    $("#preview").style.setProperty(`--c${i}`, color),
  );
  $("#preview").style.setProperty("--preview-ink", ink(colors[2]));
  $("#preview").style.setProperty("--button-ink", ink(colors[0]));
  contrastView();
}
function renderSaved() {
  $("#saved-count").textContent = saved.length;
  $("#saved-palettes").replaceChildren();
  if (!saved.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent =
      "A blank canvas. Save a palette you love and it will live here.";
    $("#saved-palettes").append(p);
  }
  saved.forEach((palette, index) => {
    const row = document.createElement("div");
    row.className = "saved-row";
    const use = document.createElement("button");
    use.className = "saved-use";
    palette.colors.forEach((color) => {
      const chip = document.createElement("i");
      chip.style.background = color;
      use.append(chip);
    });
    const label = document.createElement("span");
    label.textContent = palette.name;
    use.append(label);
    use.onclick = () => {
      setPalette(palette);
      toast("Palette loaded.");
    };
    const remove = document.createElement("button");
    remove.className = "plain";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${palette.name}`);
    remove.onclick = () => {
      saved.splice(index, 1);
      persist();
      renderSaved();
    };
    row.append(use, remove);
    $("#saved-palettes").append(row);
  });
}
function persist() {
  try {
    localStorage.setItem("huelab-v1", JSON.stringify(saved));
    return true;
  } catch {
    toast("Storage unavailable. Your palettes will last for this session.");
    return false;
  }
}
$("#generate").onclick = () => {
  if (locks.every(Boolean))
    return toast("Unlock a color to try something new.");
  remember();
  colors = generateColors(colors, locks);
  name = "An unexpected combination";
  render();
};
$("#undo").onclick = () => {
  const previous = history.pop();
  if (previous) {
    colors = previous.colors;
    name = previous.name;
    render();
  }
};
$("#save").onclick = () => {
  if (saved.some((p) => p.colors.join() === colors.join()))
    return toast("This palette is already in your collection.");
  if (saved.length >= 30)
    return toast("Your collection is full. Remove a palette to make room.");
  saved.unshift({ name, colors: [...colors] });
  const ok = persist();
  renderSaved();
  if (ok) toast("Saved to your collection.");
};
$("#export").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([cssExport(colors)], { type: "text/css" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "huelab-palette.css";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Your CSS palette is ready.");
};
$("#foreground").onchange = contrastView;
$("#background").onchange = contrastView;
$("#library-toggle").onclick = () => {
  $("#library").hidden = !$("#library").hidden;
  if (!$("#library").hidden)
    $("#library").scrollIntoView({ behavior: "smooth", block: "center" });
};
$("#library-close").onclick = () => {
  $("#library").hidden = true;
  $("#library-toggle").focus();
};
presets.forEach((preset, i) => {
  const button = document.createElement("button");
  button.className = "preset";
  button.innerHTML = `<span class="preset-colors">${preset.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</span><span class="preset-label"><span>${preset.name}</span><span>0${i + 1} ↗</span></span>`;
  button.onclick = () => setPalette(preset);
  $("#presets").append(button);
});
render();
renderSaved();
