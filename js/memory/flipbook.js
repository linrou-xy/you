const bookElement = document.querySelector("#book");
const pages = bookElement.querySelectorAll(".book-page");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const pageStatus = document.querySelector("#page-status");
const orientationStatus = document.querySelector("#orientation");
const bookRig = document.querySelector(".book-rig");
const writingCanvas = document.querySelector("#writing-canvas");
const penButton = document.querySelector("#desk-pen");
const clearWritingButton = document.querySelector("#clear-writing");
const inkSwatches = [...document.querySelectorAll(".ink-swatch")];
const drawModeButton = document.querySelector("#draw-mode");
const typeModeButton = document.querySelector("#type-mode");
const shareWallButton = document.querySelector("#share-wall");
const wishWall = document.querySelector("#wish-wall");
const wishComposer = document.querySelector("#wish-composer");
const wishForm = document.querySelector("#wish-form");
const wishProcessing = document.querySelector("#wish-processing");
const publishWishButton = document.querySelector(".publish-wish");
const wishViewer = document.querySelector("#wish-viewer");
const viewerGallery = document.querySelector("#viewer-gallery");
const viewerTrack = document.querySelector("#viewer-track");
const viewerStatus = document.querySelector("#viewer-status");
const viewerPrevious = document.querySelector("#viewer-previous");
const viewerNext = document.querySelector("#viewer-next");
const sharePreview = document.querySelector("#share-preview");
const shareImage = document.querySelector("#share-image");
const downloadShare = document.querySelector("#download-share");
const nativeShare = document.querySelector("#native-share");
const memoryTrack = document.querySelector("#memory-track");
const memoryAudio = document.querySelector("#memory-audio");
const pageWidth = Number(bookElement.dataset.pageWidth) || 512;
const pageHeight = Number(bookElement.dataset.pageHeight) || 640;
const sketchFontFamily = '"ZCOOL KuaiLe", "STKaiti", "Kaiti SC", "PingFang SC", sans-serif';
document.documentElement.style.setProperty("--page-ratio", pageWidth / pageHeight);
function syncMemoryViewport() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--memory-vh", `${Math.round(viewportHeight)}px`);
}
syncMemoryViewport();
window.addEventListener("resize", syncMemoryViewport, { passive: true });
window.addEventListener("orientationchange", syncMemoryViewport, { passive: true });
window.visualViewport?.addEventListener("resize", syncMemoryViewport, { passive: true });

const pageFlip = new St.PageFlip(bookElement, {
  width: pageWidth,
  height: pageHeight,
  size: "stretch",
  minWidth: Math.max(1, Math.round(pageWidth * 0.56)),
  maxWidth: Math.max(1, Math.round(pageWidth * 1.04)),
  minHeight: Math.max(1, Math.round(pageHeight * 0.56)),
  maxHeight: Math.max(1, Math.round(pageHeight * 1.04)),
  drawShadow: true,
  flippingTime: 760,
  usePortrait: true,
  startZIndex: 10,
  autoSize: true,
  maxShadowOpacity: 0.42,
  showCover: true,
  mobileScrollSupport: false,
  clickEventForward: true,
  useMouseEvents: true,
  swipeDistance: 24,
  showPageCorners: true,
  disableFlipByClick: false,
});

let currentPage = 0;
let isTurning = false;
let isWriting = false;
let activeInk = "#5b382d";
let activeStroke = null;
let activeViewerIndex = 0;
let viewerDrag = null;
const pageDrawings = new Map();
let wishes = [];
let wishPositions = {};

try {
  const savedWishes = JSON.parse(localStorage.getItem("lulu-birthday-wishes") || "[]");
  if (Array.isArray(savedWishes)) wishes = savedWishes;
} catch {
  wishes = [];
}
try {
  const savedPositions = JSON.parse(localStorage.getItem("lulu-wish-positions") || "{}");
  if (savedPositions && typeof savedPositions === "object" && !Array.isArray(savedPositions)) wishPositions = savedPositions;
} catch {
  wishPositions = {};
}

function wishSeed(wish) {
  const source = `${wish.name}|${wish.message}|${wish.sticker}`;
  let seed = 2166136261;
  for (const character of source) {
    seed ^= character.codePointAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function seededRandom(initialSeed) {
  let seed = initialSeed || 1;
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
}

function sketchStroke(context, points, color, scale, random, close = false) {
  for (let pass = 0; pass < 2; pass += 1) {
    context.beginPath();
    context.strokeStyle = color;
    context.globalAlpha = pass === 0 ? .82 : .24;
    context.lineWidth = (pass === 0 ? 3.1 + random() * 1.8 : 1.2 + random()) * scale;
    context.lineCap = "round";
    context.lineJoin = "round";
    points.forEach(([x, y], index) => {
      const wobble = (random() - .5) * 4 * scale;
      const nextX = x + wobble;
      const nextY = y + (random() - .5) * 4 * scale;
      if (index === 0) context.moveTo(nextX, nextY);
      else context.lineTo(nextX, nextY);
    });
    if (close) context.closePath();
    context.stroke();
  }
  context.globalAlpha = 1;
}

function drawSketchSticker(context, sticker, centerX, centerY, size, color, random) {
  const points = [];
  if (sticker === "☆") {
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 ? size * .22 : size * .48;
      const angle = -Math.PI / 2 + index * Math.PI / 5;
      points.push([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius]);
    }
    sketchStroke(context, points, color, 1, random, true);
  } else if (sticker === "✿") {
    for (let petal = 0; petal < 5; petal += 1) {
      const angle = -Math.PI / 2 + petal * Math.PI * 2 / 5;
      const petalX = centerX + Math.cos(angle) * size * .25;
      const petalY = centerY + Math.sin(angle) * size * .25;
      const ring = [];
      for (let step = 0; step < 9; step += 1) {
        const theta = step * Math.PI * 2 / 8;
        ring.push([petalX + Math.cos(theta) * size * .16, petalY + Math.sin(theta) * size * .21]);
      }
      sketchStroke(context, ring, color, 1, random, true);
    }
    sketchStroke(context, [[centerX - 3, centerY], [centerX + 3, centerY + 2]], color, 1, random);
  } else if (sticker === "☀") {
    const ring = [];
    for (let step = 0; step < 13; step += 1) {
      const theta = step * Math.PI * 2 / 12;
      ring.push([centerX + Math.cos(theta) * size * .23, centerY + Math.sin(theta) * size * .23]);
    }
    sketchStroke(context, ring, color, 1, random, true);
    for (let ray = 0; ray < 8; ray += 1) {
      const angle = ray * Math.PI / 4;
      sketchStroke(context, [
        [centerX + Math.cos(angle) * size * .32, centerY + Math.sin(angle) * size * .32],
        [centerX + Math.cos(angle) * size * .49, centerY + Math.sin(angle) * size * .49],
      ], color, 1, random);
    }
  } else {
    const heart = [
      [centerX, centerY + size * .42], [centerX - size * .38, centerY + size * .08],
      [centerX - size * .42, centerY - size * .18], [centerX - size * .2, centerY - size * .38],
      [centerX, centerY - size * .14], [centerX + size * .2, centerY - size * .38],
      [centerX + size * .42, centerY - size * .18], [centerX + size * .36, centerY + size * .08],
    ];
    sketchStroke(context, heart, color, 1, random, true);
  }
}

function splitSketchLines(context, text, maxWidth, fontSize, maxLines) {
  context.font = `400 ${fontSize}px ${sketchFontFamily}`;
  const lines = [];
  let line = "";
  for (const character of [...text]) {
    const candidate = line + character;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = character;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.join("").length < text.length && lines.length) lines[lines.length - 1] = `${lines.at(-1).slice(0, -1)}…`;
  return lines;
}

function drawRoughText(context, text, x, baseline, maxWidth, fontSize, color, random, maxLines = 1) {
  const lines = splitSketchLines(context, text, maxWidth, fontSize, maxLines);
  for (const [lineIndex, line] of lines.entries()) {
    let cursor = x;
    for (const character of [...line]) {
      context.font = `400 ${fontSize}px ${sketchFontFamily}`;
      const characterWidth = context.measureText(character).width;
      context.save();
      context.translate(cursor + characterWidth / 2 + (random() - .5) * 2.5, baseline + lineIndex * fontSize * 1.28 + (random() - .5) * 4);
      context.rotate((random() - .5) * .11);
      context.scale(.94 + random() * .12, .94 + random() * .12);
      context.fillStyle = color;
      context.textAlign = "center";
      context.textBaseline = "alphabetic";
      context.globalAlpha = 1;
      context.fillText(character, 0, 0);
      context.restore();
      cursor += characterWidth * (.93 + random() * .07);
    }
  }
}

function drawWishArtwork(context, wish, x, y, width, height) {
  const random = seededRandom(wishSeed(wish));
  context.save();
  context.translate(x, y);
  context.scale(width / 360, height / 160);
  const color = wish.inkColor || "#5b382d";
  const messageLength = [...wish.message].length;
  const messageSize = messageLength > 88 ? 16 : messageLength > 60 ? 18 : messageLength > 36 ? 21 : 27;
  const messageLines = messageLength > 60 ? 5 : messageLength > 36 ? 4 : 3;
  drawRoughText(context, wish.name, 18, 30, 235, 22, color, random, 1);
  sketchStroke(context, [[18, 41], [62, 39], [112, 42]], color, .68, random);
  drawSketchSticker(context, wish.sticker, 325, 30, 40, color, random);
  drawRoughText(context, wish.message, 20, 72, 320, messageSize, color, random, messageLines);
  sketchStroke(context, [[296, 145], [304, 139], [311, 146]], color, .5, random);
  sketchStroke(context, [[320, 144], [327, 140], [334, 145]], color, .5, random);
  context.restore();
}

function makeWishArtwork(wish) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 320;
  drawWishArtwork(canvas.getContext("2d"), wish, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function persistWishes() {
  try {
    localStorage.setItem("lulu-birthday-wishes", JSON.stringify(wishes));
  } catch {
    // The wall remains usable for the current session when storage is unavailable.
  }
}

function persistWishPositions() {
  try {
    localStorage.setItem("lulu-wish-positions", JSON.stringify(wishPositions));
  } catch {
    // Dragging still works for the current session when storage is unavailable.
  }
}

function ensureWishIds() {
  let changed = false;
  wishes.forEach((wish, index) => {
    if (wish.id) return;
    wish.id = `wish-${wishSeed(wish)}-${index}`;
    changed = true;
  });
  if (changed) persistWishes();
}

function applySavedPosition(note, wish) {
  const position = wishPositions[wish.id];
  if (!position) return;
  const wallBounds = wishWall.getBoundingClientRect();
  const noteBounds = note.getBoundingClientRect();
  const maxLeft = Math.max(0, wallBounds.width - noteBounds.width);
  const maxTop = Math.max(0, wallBounds.height - noteBounds.height);
  note.style.left = `${Math.max(0, Math.min(maxLeft, position.x * maxLeft))}px`;
  note.style.top = `${Math.max(0, Math.min(maxTop, position.y * maxTop))}px`;
  note.style.right = "auto";
  note.style.bottom = "auto";
}

function makeWishDraggable(note, openButton, wish) {
  let drag = null;
  openButton.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const noteBounds = note.getBoundingClientRect();
    const wallBounds = wishWall.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - noteBounds.left,
      offsetY: event.clientY - noteBounds.top,
      wallBounds,
      moved: false,
    };
    openButton.setPointerCapture(event.pointerId);
  });
  openButton.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.moved && distance < 6) return;
    drag.moved = true;
    note.classList.add("is-dragging");
    const maxLeft = Math.max(0, drag.wallBounds.width - note.offsetWidth);
    const maxTop = Math.max(0, drag.wallBounds.height - note.offsetHeight);
    const left = Math.max(0, Math.min(maxLeft, event.clientX - drag.wallBounds.left - drag.offsetX));
    const top = Math.max(0, Math.min(maxTop, event.clientY - drag.wallBounds.top - drag.offsetY));
    note.style.left = `${left}px`;
    note.style.top = `${top}px`;
    note.style.right = "auto";
    note.style.bottom = "auto";
    wishPositions[wish.id] = { x: maxLeft ? left / maxLeft : 0, y: maxTop ? top / maxTop : 0 };
  });
  const finishDrag = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.moved) {
      note.dataset.justDragged = "true";
      persistWishPositions();
      requestAnimationFrame(() => note.classList.remove("is-dragging"));
    }
    drag = null;
  };
  openButton.addEventListener("pointerup", finishDrag);
  openButton.addEventListener("pointercancel", finishDrag);
}

function noteStyleFor(wish, index) {
  const legacyStyles = { "#f2c5ca": "pink", "#bfe0d7": "lined", "#cbd8ee": "torn", "#f7df9b": "torn" };
  return wish.noteStyle || legacyStyles[wish.noteColor] || ["pink", "lined", "torn"][index % 3];
}

function updateViewerParallax() {
  const galleryCenter = viewerGallery.scrollLeft + viewerGallery.clientWidth / 2;
  const cards = [...viewerTrack.querySelectorAll(".viewer-card")];
  let closestIndex = 0;
  let closestDistance = Infinity;
  cards.forEach((card, index) => {
    const center = card.offsetLeft + card.offsetWidth / 2;
    const distance = center - galleryCenter;
    if (Math.abs(distance) < closestDistance) {
      closestDistance = Math.abs(distance);
      closestIndex = index;
    }
    card.style.setProperty("--parallax", `${Math.max(-24, Math.min(24, distance * -.065))}px`);
    card.classList.toggle("is-current", index === closestIndex);
  });
  activeViewerIndex = closestIndex;
  viewerStatus.textContent = cards.length ? `${closestIndex + 1} / ${cards.length}` : "";
  viewerPrevious.disabled = closestIndex <= 0;
  viewerNext.disabled = closestIndex >= cards.length - 1;
}

function scrollViewerTo(index, behavior = "smooth") {
  const cards = [...viewerTrack.querySelectorAll(".viewer-card")];
  const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
  if (!card) return;
  viewerGallery.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - viewerGallery.clientWidth / 2, behavior });
}

function buildViewer() {
  viewerTrack.replaceChildren();
  wishes.forEach((wish, index) => {
    const card = document.createElement("article");
    const artwork = document.createElement("img");
    card.className = `viewer-card note-style-${noteStyleFor(wish, index)}`;
    card.style.setProperty("--viewer-rotation", `${[-1.2, .8, -.5][index % 3]}deg`);
    card.setAttribute("aria-label", `来自 ${wish.name} 的祝福：${wish.message}`);
    artwork.className = "viewer-artwork";
    artwork.src = makeWishArtwork(wish);
    artwork.alt = `${wish.name}：${wish.message}`;
    card.append(artwork);
    viewerTrack.append(card);
  });
}

function openWish(wish) {
  buildViewer();
  activeViewerIndex = Math.max(0, wishes.indexOf(wish));
  wishViewer.showModal();
  requestAnimationFrame(() => {
    scrollViewerTo(activeViewerIndex, "instant");
    updateViewerParallax();
    viewerGallery.focus({ preventScroll: true });
  });
}

function renderWishes() {
  for (const note of wishWall.querySelectorAll(".wish-note")) note.remove();
  ensureWishIds();
  const rotations = ["-3deg", "2deg", "-1deg", "3deg", "-2deg", "1deg", "-2deg", "2deg"];
  for (const [index, wish] of wishes.slice(0, 8).entries()) {
    const note = document.createElement("div");
    const openButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    const artwork = document.createElement("img");
    const noteStyle = noteStyleFor(wish, index);
    note.className = `wish-note note-style-${noteStyle} wish-slot-${index}`;
    note.style.setProperty("--note-color", wish.noteColor);
    note.style.setProperty("--ink-color", wish.inkColor);
    note.style.setProperty("--note-rotation", rotations[index]);
    note.style.setProperty("--note-delay", `${index * 90}ms`);
    note.style.setProperty("--breeze-delay", `${-index * .73}s`);
    note.style.setProperty("--breeze-duration", `${5.1 + (index % 4) * .55}s`);
    openButton.type = "button";
    openButton.className = "wish-note-open";
    openButton.setAttribute("aria-label", `查看 ${wish.name} 的祝福`);
    artwork.className = "wish-artwork";
    artwork.src = makeWishArtwork(wish);
    artwork.alt = "";
    deleteButton.type = "button";
    deleteButton.className = "wish-note-delete";
    deleteButton.textContent = "×";
    deleteButton.title = "删除便签";
    deleteButton.setAttribute("aria-label", `删除 ${wish.name} 的祝福`);
    openButton.append(artwork);
    note.append(openButton, deleteButton);
    openButton.addEventListener("click", () => {
      if (note.dataset.justDragged === "true") {
        delete note.dataset.justDragged;
        return;
      }
      openWish(wish);
    });
    deleteButton.addEventListener("click", () => {
      const wishIndex = wishes.indexOf(wish);
      if (wishIndex < 0) return;
      wishes.splice(wishIndex, 1);
      delete wishPositions[wish.id];
      persistWishes();
      persistWishPositions();
      if (wishViewer.open) wishViewer.close();
      renderWishes();
    });
    wishWall.append(note);
    applySavedPosition(note, wish);
    makeWishDraggable(note, openButton, wish);
  }
}

function wrapCanvasText(context, text, maxWidth, maxLines = 3) {
  const lines = [];
  let line = "";
  for (const character of [...text]) {
    const candidate = line + character;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = character;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.join("").length < text.length && lines.length) lines[lines.length - 1] += "…";
  return lines;
}

function roundedRect(context, x, y, width, height, radius, color) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

function loadCanvasImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = new URL(source, document.baseURI).href;
  });
}

async function loadCanvasImageSafe(source) {
  try {
    return await loadCanvasImage(source);
  } catch (error) {
    console.warn("Share image asset unavailable", source, error);
    return null;
  }
}

function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(",");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: header.match(/data:([^;]+)/)?.[1] || "image/png" });
}

function drawSharePaper(context, width, height) {
  const random = seededRandom(27092026);
  context.fillStyle = "#f2eee7";
  context.fillRect(0, 0, width, height);
  context.save();
  context.globalAlpha = .16;
  for (let index = 0; index < 920; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const length = 2 + random() * 12;
    context.strokeStyle = random() > .55 ? "#b9a89a" : "#fffdf8";
    context.lineWidth = .45 + random() * .8;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + length * (.5 + random()), y + (random() - .5) * 4);
    context.stroke();
  }
  context.restore();
}

function drawShareTape(context, x, y, width, height, color, rotation) {
  context.save();
  context.translate(x + width / 2, y + height / 2);
  context.rotate(rotation * Math.PI / 180);
  context.fillStyle = color;
  context.globalAlpha = .8;
  context.fillRect(-width / 2, -height / 2, width, height);
  context.globalAlpha = .16;
  context.strokeStyle = "#fff";
  for (let line = -width / 2 + 7; line < width / 2; line += 10) {
    context.beginPath();
    context.moveTo(line, -height / 2);
    context.lineTo(line + 5, height / 2);
    context.stroke();
  }
  context.restore();
}

function cropTransparentCanvas(source) {
  const context = source.getContext("2d");
  const pixels = context.getImageData(0, 0, source.width, source.height).data;
  let left = source.width;
  let top = source.height;
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < source.height; y += 2) {
    for (let x = 0; x < source.width; x += 2) {
      if (pixels[(y * source.width + x) * 4 + 3] < 8) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right <= left || bottom <= top) return source;
  const padding = 18;
  const cropX = Math.max(0, left - padding);
  const cropY = Math.max(0, top - padding);
  const cropWidth = Math.min(source.width - cropX, right - left + padding * 2);
  const cropHeight = Math.min(source.height - cropY, bottom - top + padding * 2);
  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  cropped.getContext("2d").drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return cropped;
}

async function captureCurrentBook() {
  const lastPage = pages.length - 1;
  const isSinglePage = currentPage === 0 || currentPage === lastPage || bookElement.dataset.layout === "portrait";
  const pageIndexes = isSinglePage ? [currentPage] : [currentPage, Math.min(currentPage + 1, lastPage)];
  const pageCaptures = [];
  for (const pageIndex of pageIndexes) {
    const sourcePage = pages[pageIndex];
    const capture = document.createElement("canvas");
    capture.width = 960;
    capture.height = 640;
    const drawingContext = capture.getContext("2d");
    drawingContext.fillStyle = "#f7f4ed";
    drawingContext.fillRect(0, 0, capture.width, capture.height);

    if (pageIndex === 0) {
      const cover = await loadCanvasImageSafe("../../images/memory/cover/cover-preview.png");
      if (cover) drawingContext.drawImage(cover, 0, 0, capture.width, capture.height);
    } else {
      const photo = sourcePage.querySelector(".card-plate img");
      if (photo) {
        const image = await loadCanvasImageSafe(photo.getAttribute("src"));
        const frame = { x: 34, y: 26, width: 892, height: 566 };
        if (!image) {
          drawingContext.fillStyle = "#eee8dc";
          drawingContext.fillRect(34, 26, 892, 566);
          drawingContext.fillStyle = "#8b7667";
          drawingContext.font = '500 28px "Songti SC", "STSong", serif';
          drawingContext.textAlign = "center";
          drawingContext.fillText("回忆照片", capture.width / 2, capture.height / 2);
          pageCaptures.push(capture);
          continue;
        }
        const scale = Math.min(frame.width / image.naturalWidth, frame.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        drawingContext.drawImage(image, frame.x + (frame.width - width) / 2, frame.y + (frame.height - height) / 2, width, height);
        drawingContext.fillStyle = "#9a7862";
        drawingContext.font = '500 18px "Songti SC", "STSong", serif';
        drawingContext.textAlign = sourcePage.classList.contains("verso") ? "left" : "right";
        drawingContext.fillText(sourcePage.querySelector(".folio")?.textContent || "", sourcePage.classList.contains("verso") ? 68 : 892, 610);
      } else if (sourcePage.classList.contains("cloth")) {
        const cloth = await loadCanvasImageSafe("../../images/memory/cover/star-fabric.jpg");
        if (cloth) drawingContext.drawImage(cloth, 0, 0, capture.width, capture.height);
      } else {
        const lines = sourcePage.innerText.trim().split(/\n+/).filter(Boolean);
        drawingContext.fillStyle = "#5b382d";
        drawingContext.textAlign = "center";
        drawingContext.font = '500 36px "Songti SC", "STSong", serif';
        lines.forEach((line, index) => drawingContext.fillText(line, capture.width / 2, capture.height / 2 + (index - (lines.length - 1) / 2) * 62));
      }
    }
    for (const stroke of pageDrawings.get(pageIndex) || []) {
      drawStroke(drawingContext, stroke, capture.width, capture.height);
    }
    pageCaptures.push(capture);
  }
  const spread = document.createElement("canvas");
  spread.width = pageCaptures.reduce((width, capture) => width + capture.width, 0);
  spread.height = Math.max(...pageCaptures.map((capture) => capture.height));
  const spreadContext = spread.getContext("2d");
  let offsetX = 0;
  for (const capture of pageCaptures) {
    spreadContext.drawImage(capture, offsetX, (spread.height - capture.height) / 2);
    offsetX += capture.width;
  }
  return spread;
}

async function generateShareImage() {
  const originalLabel = shareWallButton.textContent;
  shareWallButton.disabled = true;
  shareWallButton.textContent = "正在截取书页…";
  await document.fonts.ready;
  try {
    const visibleWishes=wishes.slice(0,8),rows=Math.max(1,Math.ceil(visibleWishes.length/2));
    const scene=document.createElement('canvas');scene.width=1400;scene.height=880+rows*245;
    const context=scene.getContext('2d');
    const sky=context.createLinearGradient(0,0,0,scene.height);sky.addColorStop(0,'#dcebe3');sky.addColorStop(.45,'#eee8d7');sky.addColorStop(1,'#bad39f');context.fillStyle=sky;context.fillRect(0,0,scene.width,scene.height);
    context.strokeStyle='rgba(75,105,92,.13)';context.lineWidth=2;for(let y=70;y<scene.height;y+=64){context.beginPath();context.moveTo(0,y);context.lineTo(scene.width,y);context.stroke();}
    context.fillStyle='#50362e';context.textAlign='center';context.font='700 42px "PingFang SC","Microsoft YaHei",sans-serif';context.fillText('噜噜晓的朋友们',700,62);
    context.font='600 25px "PingFang SC","Microsoft YaHei",sans-serif';context.fillText(`当前书页 · ${pageStatus.textContent}`,700,102);
    const book=await captureCurrentBook();const bookScale=Math.min(1240/book.width,610/book.height),bookWidth=book.width*bookScale,bookHeight=book.height*bookScale,bookX=(scene.width-bookWidth)/2,bookY=140+(610-bookHeight)/2;
    context.save();context.shadowColor='rgba(53,35,28,.25)';context.shadowBlur=28;context.shadowOffsetY=14;context.fillStyle='#fffdf7';context.fillRect(bookX-12,bookY-12,bookWidth+24,bookHeight+24);context.drawImage(book,bookX,bookY,bookWidth,bookHeight);context.restore();
    context.fillStyle='#5b382d';context.font='600 24px "PingFang SC","Microsoft YaHei",sans-serif';context.fillText('谢谢你曾努力地找到我，选择我。这一次，换我们沿着你的路，走来见你。',700,810);
    const notes=visibleWishes.length?visibleWishes:[{name:'噜噜晓的朋友们',message:'愿每一个人都能活成自己想要的样子。',inkColor:'#5b382d'}];
    notes.forEach((wish,index)=>{const column=index%2,row=Math.floor(index/2),x=70+column*660,y=850+row*245,width=610,height=205;roundedRect(context,x,y,width,height,18,index%3===0?'#fff3dc':index%3===1?'#f8dce2':'#dcebf0');context.save();context.fillStyle=wish.inkColor||'#5b382d';context.textAlign='left';context.font='700 25px "PingFang SC","Microsoft YaHei",sans-serif';context.fillText(wish.name||'匿名朋友',x+34,y+43);context.font='500 22px "PingFang SC","Microsoft YaHei",sans-serif';const lines=wrapCanvasText(context,wish.message||'',width-68,5);lines.forEach((line,lineIndex)=>context.fillText(line,x+34,y+82+lineIndex*27));context.restore();});
    const blob=await new Promise((resolve,reject)=>{
      if (typeof scene.toBlob !== "function") {
        try { resolve(dataUrlToBlob(scene.toDataURL("image/png"))); } catch (error) { reject(error); }
        return;
      }
      scene.toBlob(value=>{
        if (value) { resolve(value); return; }
        try { resolve(dataUrlToBlob(scene.toDataURL("image/png"))); } catch (error) { reject(error); }
      },'image/png');
    });
    const fileName=`噜噜晓-回忆册-${pageStatus.textContent.replace(/\s+/g, "")}.png`;
    if(downloadShare.dataset.objectUrl)URL.revokeObjectURL(downloadShare.dataset.objectUrl);
    const objectUrl=URL.createObjectURL(blob);
    downloadShare.dataset.objectUrl=objectUrl;
    shareImage.src=objectUrl;
    downloadShare.href=objectUrl;
    downloadShare.download=fileName;
    const file=new File([blob],fileName,{type:'image/png'});
    const canShare=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));
    nativeShare.hidden=!canShare;
    nativeShare.onclick=async()=>{try{await navigator.share({files:[file],title:'噜噜晓的27年',text:'一起翻开这本回忆册'});}catch(error){if(error.name!=='AbortError')downloadShare.click();}};
    sharePreview.showModal();
    return;
  } catch (error) {
    console.error("Unable to generate share image", error);
    shareWallButton.textContent = "生成失败，请重试";
    setTimeout(()=>{shareWallButton.textContent=originalLabel;},1800);
  } finally {
    shareWallButton.disabled = false;
    if(shareWallButton.textContent==="正在截取书页…")shareWallButton.textContent = originalLabel;
  }
  return;
  let bookCapture;
  try {
    bookCapture = await captureCurrentBook();
  } catch (error) {
    console.error("Unable to capture current book page", error);
    bookCapture = document.createElement("canvas");
    bookCapture.width = 960;
    bookCapture.height = 540;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext("2d");
  drawSharePaper(context, canvas.width, canvas.height);
  context.fillStyle = "#35231e";
  context.fillRect(0, 0, canvas.width, 18);
  context.fillStyle = "#7f6251";
  context.font = '600 18px "PingFang SC", sans-serif';
  context.textAlign = "left";
  context.fillText("GROUP MEMORIES · 2026", 64, 72);
  context.fillStyle = "#432b22";
  context.font = '700 64px "Songti SC", "STSong", serif';
  context.fillText("噜噜晓的朋友们", 62, 150);
  context.fillStyle = "#9a7862";
  context.font = '500 22px "PingFang SC", sans-serif';
  context.fillText(`此刻翻到这里 · ${pageStatus.textContent}`, 66, 196);
  context.fillStyle = "rgba(107,73,55,.18)";
  context.fillRect(64, 218, 952, 2);

  const frame = { x: 54, y: 260, width: 972, height: 560 };
  const captureScale = Math.min(frame.width / bookCapture.width, frame.height / bookCapture.height);
  const captureWidth = bookCapture.width * captureScale;
  const captureHeight = bookCapture.height * captureScale;
  const captureX = frame.x + (frame.width - captureWidth) / 2;
  const captureY = frame.y + (frame.height - captureHeight) / 2;
  context.save();
  context.shadowColor = "rgba(54,32,23,.24)";
  context.shadowBlur = 30;
  context.shadowOffsetY = 16;
  context.drawImage(bookCapture, captureX, captureY, captureWidth, captureHeight);
  context.restore();
  drawShareTape(context, 76, 248, 142, 34, "#d8a5a1", -5);
  drawShareTape(context, 860, 782, 132, 32, "#9da68b", 4);

  const noteAssets = {
    pink: "../../images/memory/ui/note-tape-envelope.png",
    lined: "../../images/memory/ui/note-tape-cloud.png",
    torn: "../../images/memory/ui/note-tape-leaf.png",
  };
  const visibleWishes = wishes.slice(0, 2);
  for (const [index, wish] of visibleWishes.entries()) {
    const x = 52 + index * 494;
    const y = 850 + index * 24;
    const width = 480;
    const height = 360;
    const noteImage = await loadCanvasImage(noteAssets[noteStyleFor(wish, index)]);
    context.save();
    context.translate(x + width / 2, y + height / 2);
    context.rotate((index ? 1.5 : -1.2) * Math.PI / 180);
    context.translate(-(x + width / 2), -(y + height / 2));
    context.shadowColor = "rgba(76,45,34,.15)";
    context.shadowBlur = 14;
    context.shadowOffsetY = 9;
    context.drawImage(noteImage, x, y, width, height);
    context.shadowColor = "transparent";
    drawWishArtwork(context, wish, x + 52, y + 88, width - 104, 168);
    context.restore();
  }

  context.fillStyle = "#5b382d";
  context.textAlign = "center";
  context.font = '600 25px "Songti SC", "STSong", serif';
  context.fillText("谢谢你曾努力地找到我，选择我。", 540, 1288);
  context.fillText("这一次，换我们沿着你的路，走来见你。", 540, 1328);
  context.fillStyle = "#9a7862";
  context.font = '500 17px "PingFang SC", sans-serif';
  context.fillText(`噜噜晓的朋友们 · ${wishes.length} 份祝福`, 540, 1390);
  const dataUrl = canvas.toDataURL("image/png");
  shareImage.src = dataUrl;
  downloadShare.href = dataUrl;
  sharePreview.showModal();
  shareWallButton.disabled = false;
  shareWallButton.textContent = originalLabel;
}

function currentDrawing() {
  if (!pageDrawings.has(currentPage)) pageDrawings.set(currentPage, []);
  return pageDrawings.get(currentPage);
}

function drawStroke(context, stroke, width, height) {
  if (!stroke.points.length) return;
  context.beginPath();
  context.strokeStyle = stroke.color;
  context.lineWidth = Math.max(2, Math.min(width, height) * stroke.width);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.moveTo(stroke.points[0].x * width, stroke.points[0].y * height);
  for (const point of stroke.points.slice(1)) context.lineTo(point.x * width, point.y * height);
  context.stroke();
}

function redrawWriting() {
  const width = writingCanvas.clientWidth;
  const height = writingCanvas.clientHeight;
  const context = writingCanvas.getContext("2d");
  context.clearRect(0, 0, width, height);
  for (const stroke of currentDrawing()) drawStroke(context, stroke, width, height);
}

function syncWritingCanvas() {
  const rigRect = bookRig.getBoundingClientRect();
  const bookRect = bookElement.getBoundingClientRect();
  const landscape = bookElement.dataset.layout === "landscape";
  const edge = bookElement.dataset.edge;
  let left = bookRect.left - rigRect.left;
  let width = bookRect.width;

  if (landscape && edge === "front") {
    left += width / 2;
    width /= 2;
  } else if (landscape && edge === "back") {
    width /= 2;
  }

  const top = bookRect.top - rigRect.top;
  const height = bookRect.height;
  writingCanvas.style.left = `${left}px`;
  writingCanvas.style.top = `${top}px`;
  writingCanvas.style.width = `${width}px`;
  writingCanvas.style.height = `${height}px`;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
  const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
  if (writingCanvas.width !== pixelWidth || writingCanvas.height !== pixelHeight) {
    writingCanvas.width = pixelWidth;
    writingCanvas.height = pixelHeight;
  }
  writingCanvas.getContext("2d").setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  redrawWriting();
}

function setWritingMode(nextValue) {
  isWriting = nextValue;
  bookRig.classList.toggle("is-writing", isWriting);
  drawModeButton.classList.toggle("is-active", isWriting);
  drawModeButton.setAttribute("aria-pressed", String(isWriting));
  penButton.setAttribute("aria-pressed", String(isWriting));
  penButton.setAttribute("aria-label", isWriting ? "放下笔并结束书写" : "拿起笔开始书写");
  penButton.title = isWriting ? "放下笔" : "拿起笔写字";
  if (isWriting) requestAnimationFrame(syncWritingCanvas);
}

function pointerPoint(event) {
  const rect = writingCanvas.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

function updateControls() {
  const pageCount = pageFlip.getPageCount();
  const lastPage = pageCount - 1;
  bookElement.dataset.edge = currentPage === 0 ? "front" : currentPage === lastPage ? "back" : "inside";

  previousButton.disabled = currentPage === 0 || isTurning;
  nextButton.disabled = currentPage === lastPage || isTurning;

  if (currentPage === 0) {
    pageStatus.textContent = "封面";
  } else if (currentPage === lastPage) {
    pageStatus.textContent = "封底";
  } else {
    pageStatus.textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;
  }

  requestAnimationFrame(syncWritingCanvas);
}

pageFlip.on("flip", (event) => {
  currentPage = Number(event.data);
  updateControls();
});

pageFlip.on("changeState", (event) => {
  isTurning = event.data !== "read";
  writingCanvas.classList.toggle("is-turning", isTurning);
  updateControls();
});

function updateOrientation(orientation) {
  bookElement.dataset.layout = orientation;
  orientationStatus.textContent = orientation === "portrait" ? "单页" : "打开的书页";
  requestAnimationFrame(syncWritingCanvas);
}

pageFlip.on("init", (event) => updateOrientation(event.data.mode));
pageFlip.on("changeOrientation", (event) => updateOrientation(event.data));

pageFlip.loadFromHTML(pages);
updateControls();
new ResizeObserver(syncWritingCanvas).observe(bookElement);
document.fonts.load('32px "ZCOOL KuaiLe"').then(renderWishes, renderWishes);

penButton.addEventListener("click", () => setWritingMode(!isWriting));
drawModeButton.addEventListener("click", () => setWritingMode(!isWriting));
typeModeButton.addEventListener("click", () => {
  setWritingMode(false);
  typeModeButton.classList.add("is-active");
  wishComposer.showModal();
  requestAnimationFrame(() => document.querySelector("#wish-name").focus());
});
shareWallButton.addEventListener("click", generateShareImage);
const musicSources={brave:'../../audio/brave-princess.mp3',bedtime:'../../audio/bedtime-story.mp3',peach:'../../audio/peach-blossom-smile.mp3',remember:'../../audio/remember-me.mp3'};
const embeddedMemory=new URLSearchParams(location.search).get('embedded')==='1'&&window.parent!==window;
if(embeddedMemory){memoryTrack.value='remember';document.querySelector('.exit-memory')?.addEventListener('click',e=>{e.preventDefault();parent.postMessage({type:'memory-exit'},'*');});}
memoryTrack.addEventListener('change',async()=>{memoryAudio.pause();if(embeddedMemory){parent.postMessage({type:'memory-music',track:memoryTrack.value},'*');return;}memoryAudio.currentTime=0;const src=musicSources[memoryTrack.value];if(!src){memoryAudio.removeAttribute('src');return;}memoryAudio.src=src;memoryAudio.loop=true;try{await memoryAudio.play();}catch{memoryTrack.value='';}});
viewerGallery.addEventListener("scroll", () => requestAnimationFrame(updateViewerParallax), { passive: true });
viewerGallery.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  event.preventDefault();
  viewerGallery.scrollLeft += event.deltaY;
}, { passive: false });
viewerGallery.addEventListener("pointerdown", (event) => {
  viewerDrag = { id: event.pointerId, x: event.clientX, scrollLeft: viewerGallery.scrollLeft };
  viewerGallery.setPointerCapture(event.pointerId);
  viewerGallery.classList.add("is-dragging");
});
viewerGallery.addEventListener("pointermove", (event) => {
  if (!viewerDrag || viewerDrag.id !== event.pointerId) return;
  viewerGallery.scrollLeft = viewerDrag.scrollLeft - (event.clientX - viewerDrag.x);
});
function finishViewerDrag(event) {
  if (!viewerDrag || viewerDrag.id !== event.pointerId) return;
  viewerDrag = null;
  viewerGallery.classList.remove("is-dragging");
  scrollViewerTo(activeViewerIndex);
}
viewerGallery.addEventListener("pointerup", finishViewerDrag);
viewerGallery.addEventListener("pointercancel", finishViewerDrag);
viewerGallery.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") scrollViewerTo(activeViewerIndex - 1);
  if (event.key === "ArrowRight") scrollViewerTo(activeViewerIndex + 1);
});
viewerPrevious.addEventListener("click", () => scrollViewerTo(activeViewerIndex - 1));
viewerNext.addEventListener("click", () => scrollViewerTo(activeViewerIndex + 1));

wishForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(wishForm);
  const wish = {
    id: globalThis.crypto?.randomUUID?.() || `wish-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: String(formData.get("name") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    noteColor: "#fffaf2",
    noteStyle: String(formData.get("noteStyle") || "pink"),
    inkColor: String(formData.get("inkColor") || "#5b382d"),
    sticker: String(formData.get("sticker") || "♡"),
  };
  publishWishButton.disabled = true;
  publishWishButton.textContent = "正在生成手绘图案…";
  wishProcessing.hidden = false;
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  makeWishArtwork(wish);
  wishes.unshift(wish);
  persistWishes();
  renderWishes();
  wishForm.reset();
  wishProcessing.hidden = true;
  publishWishButton.disabled = false;
  publishWishButton.textContent = "生成并发布祝福";
  wishComposer.close();
});

for (const closeButton of document.querySelectorAll("[data-close-dialog]")) {
  closeButton.addEventListener("click", () => closeButton.closest("dialog").close());
}

for (const dialog of [wishComposer, wishViewer, sharePreview]) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

wishComposer.addEventListener("close", () => typeModeButton.classList.remove("is-active"));

for (const swatch of inkSwatches) {
  swatch.addEventListener("click", () => {
    activeInk = swatch.dataset.ink;
    for (const item of inkSwatches) item.classList.toggle("is-active", item === swatch);
  });
}

clearWritingButton.addEventListener("click", () => {
  pageDrawings.set(currentPage, []);
  redrawWriting();
});

writingCanvas.addEventListener("pointerdown", (event) => {
  if (!isWriting || isTurning) return;
  event.preventDefault();
  writingCanvas.setPointerCapture(event.pointerId);
  activeStroke = { color: activeInk, width: 0.006, points: [pointerPoint(event)] };
  currentDrawing().push(activeStroke);
});

writingCanvas.addEventListener("pointermove", (event) => {
  if (!activeStroke || !writingCanvas.hasPointerCapture(event.pointerId)) return;
  event.preventDefault();
  activeStroke.points.push(pointerPoint(event));
  redrawWriting();
});

function finishStroke(event) {
  if (!activeStroke) return;
  if (writingCanvas.hasPointerCapture(event.pointerId)) writingCanvas.releasePointerCapture(event.pointerId);
  activeStroke = null;
}

writingCanvas.addEventListener("pointerup", finishStroke);
writingCanvas.addEventListener("pointercancel", finishStroke);
window.addEventListener("resize", syncWritingCanvas);

const requestedPage = Number(new URLSearchParams(location.search).get("page"));
if (Number.isInteger(requestedPage) && requestedPage >= 0 && requestedPage < pages.length) {
  pageFlip.turnToPage(requestedPage);
}

previousButton.addEventListener("click", () => {
  if (!isTurning) pageFlip.flipPrev("bottom");
});

nextButton.addEventListener("click", () => {
  if (!isTurning) pageFlip.flipNext("bottom");
});

window.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || isTurning || event.target.closest("button")) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    pageFlip.flipPrev("bottom");
  }

  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    pageFlip.flipNext("bottom");
  }

  if (event.key === "Home") pageFlip.turnToPage(0);
  if (event.key === "End") pageFlip.turnToPage(pageFlip.getPageCount() - 1);
});
