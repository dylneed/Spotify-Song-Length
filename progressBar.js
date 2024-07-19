const outlineSuffix = "_progressOutline"
const barSuffix = "_progressBar"

function createProgressBar(id,parentId="progress_bars") {
  const outline = document.createElement("div");
  outline.classList.add("progress-outline");
  outline.setAttribute('id', id + outlineSuffix);

  const bar = document.createElement("div");
  bar.classList.add("progress-bar");
  bar.setAttribute('id', id + barSuffix);

  document.getElementById(parentId).appendChild(outline);
  outline.appendChild(bar);
}

function updateProgressBar(ratio,id,txt="") {
  ratio = ratio < 0 ? 0 : (ratio > 1 ? 1 : ratio)

  const bar = document.getElementById(id + barSuffix);
  let width = Math.floor(100 * ratio);
  bar.style.width = width + "%";
  bar.innerHTML = txt;
}

function removeProgressBar(id, parentId="progress_bars") {
  const parent = document.getElementById(parentId);
  const progressBar = document.getElementById(id + outlineSuffix);
  parent.removeChild(progressBar);
}