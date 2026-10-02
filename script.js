// ============================================================
// WEDDING INVITATION — screenshot-matched mobile layout
// Numbered image order: images/1.jpg, images/2.jpg, images/3.jpg ...
// Also supports .JPG / .jpeg / .png and gallery1.jpg-style names.
// ============================================================

const WEDDING_YEAR = 2027;
const WEDDING_MONTH = 8;  // 1~12
const WEDDING_DAY = 22;

const MAX_IMAGES = 60;
const PREVIEW_PHOTOS = 8;

let galleryImages = [];
let currentGalleryIndex = 0;



// ============================================================
// BGM
// ============================================================

const bgm = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");

let musicWanted = true;

async function tryPlayMusic() {
  if (!bgm || !musicWanted) return;

  try {
    await bgm.play();
    musicToggle?.classList.add("playing");
  } catch (error) {
    musicToggle?.classList.remove("playing");
  }
}

// 자동재생 시도
tryPlayMusic();

// iPhone / 모바일 브라우저 자동재생 차단 대응:
// 사용자가 페이지를 처음 터치하거나 클릭하면 재생을 다시 시도합니다.
["touchstart", "pointerdown", "click"].forEach(eventName => {
  window.addEventListener(
    eventName,
    () => {
      if (musicWanted && bgm?.paused) {
        tryPlayMusic();
      }
    },
    {
      once: true,
      passive: true
    }
  );
});

musicToggle?.addEventListener("click", async event => {
  event.stopPropagation();

  if (!bgm) return;

  if (bgm.paused) {
    musicWanted = true;
    await tryPlayMusic();
  } else {
    musicWanted = false;
    bgm.pause();
    musicToggle.classList.remove("playing");
  }
});

// ============================================================
// MENU
// ============================================================

const menuBtn = document.getElementById("menuBtn");
const menuDrawer = document.getElementById("menuDrawer");
const menuClose = document.getElementById("menuClose");

function openMenu() {
  menuDrawer?.classList.add("open");
  menuDrawer?.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  menuDrawer?.classList.remove("open");
  menuDrawer?.setAttribute("aria-hidden", "true");
}

menuBtn?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);

menuDrawer?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMenu);
});


// ============================================================
// CALENDAR
// ============================================================

function buildCalendar() {
  const root = document.getElementById("calendar");
  if (!root) return;

  root.innerHTML = "";

  const heads = ["S", "M", "T", "W", "T", "F", "S"];

  heads.forEach((label, index) => {
    const el = document.createElement("div");
    el.className = `cal-head${index === 0 ? " sun" : ""}`;
    el.textContent = label;
    root.appendChild(el);
  });

  const firstDay = new Date(
    WEDDING_YEAR,
    WEDDING_MONTH - 1,
    1
  ).getDay();

  const lastDate = new Date(
    WEDDING_YEAR,
    WEDDING_MONTH,
    0
  ).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "cal-day empty";
    blank.textContent = "0";
    root.appendChild(blank);
  }

  for (let day = 1; day <= lastDate; day++) {
    const weekday = new Date(
      WEDDING_YEAR,
      WEDDING_MONTH - 1,
      day
    ).getDay();

    const el = document.createElement("div");

    el.className =
      "cal-day" +
      (weekday === 0 ? " sun" : "") +
      (day === WEDDING_DAY ? " selected" : "");

    el.textContent = day;
    root.appendChild(el);
  }
}

buildCalendar();


// ============================================================
// IMAGE DISCOVERY
// ============================================================

const extensions = [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG"];

function testImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function findImageByNumber(number) {
  const candidates = [];

  // primary: images/1.jpg, images/2.jpg ...
  for (const ext of extensions) {
    candidates.push(`images/${number}${ext}`);
  }

  // fallback: images/gallery1.jpg, gallery2.JPG ...
  for (const ext of extensions) {
    candidates.push(`images/gallery${number}${ext}`);
  }

  for (const src of candidates) {
    const found = await testImage(src);
    if (found) return found;
  }

  return null;
}

async function discoverImages() {
  const found = [];

  for (let i = 1; i <= MAX_IMAGES; i++) {
    const src = await findImageByNumber(i);

    // numbering is expected to be sequential.
    if (!src) break;

    found.push(src);
  }

  galleryImages = found;


  renderGallery();
}


// ============================================================
// HERO FALLBACK
// ============================================================

document.getElementById("heroImage")?.addEventListener("error", e => {
  e.currentTarget.style.opacity = "0";
});


// ============================================================
// GALLERY
// screenshot: 3 columns × 2 rows / 5 photos + MORE tile
// ============================================================

const galleryGrid = document.getElementById("galleryGrid");
const galleryModal = document.getElementById("galleryModal");
const modalImage = document.getElementById("galleryModalImage");
const modalCount = document.getElementById("galleryCount");
const modalClose = document.getElementById("galleryClose");
const modalPrev = document.getElementById("galleryPrev");
const modalNext = document.getElementById("galleryNext");

function makePhotoTile(src, index) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "gallery-item";
  btn.setAttribute("aria-label", `갤러리 ${index + 1}번 사진 보기`);

  const img = document.createElement("img");
  img.src = src;
  img.alt = `웨딩 갤러리 ${index + 1}`;
  img.loading = "lazy";

  btn.appendChild(img);
  btn.addEventListener("click", () => openGallery(index));

  return btn;
}

function makePlaceholderTile(number) {
  const tile = document.createElement("div");
  tile.className = "gallery-item";

  const span = document.createElement("span");
  span.className = "gallery-placeholder";
  span.textContent = "Preview";

  tile.appendChild(span);
  return tile;
}

function renderGallery() {
  if (!galleryGrid) return;

  galleryGrid.innerHTML = "";

  // Hero is image 1. Gallery begins from image 2.
  const photos = galleryImages.slice(1);

  for (let i = 0; i < PREVIEW_PHOTOS; i++) {
    if (photos[i]) {
      galleryGrid.appendChild(makePhotoTile(photos[i], i + 1));
    } else {
      galleryGrid.appendChild(makePlaceholderTile(i + 2));
    }
  }

  const more = document.createElement("button");
  more.type = "button";
  more.className = "gallery-more-tile";
  more.setAttribute("aria-label", "전체 갤러리 보기");

  const sixth = photos[PREVIEW_PHOTOS];

  if (sixth) {
    const bg = document.createElement("img");
    bg.src = sixth;
    bg.alt = "";
    bg.loading = "lazy";
    more.appendChild(bg);
  }

  const moreCopy = document.createElement("span");
  moreCopy.className = "more-copy";

  const remaining = Math.max(photos.length - PREVIEW_PHOTOS, 1);

  moreCopy.innerHTML = `
    <strong>+${remaining}</strong>
    <span>MORE</span>
  `;

  more.appendChild(moreCopy);

  more.addEventListener("click", () => {
    const startIndex = galleryImages.length > 1 ? 1 : 0;
    openGallery(startIndex);
  });

  galleryGrid.appendChild(more);
}


// ============================================================
// GALLERY MODAL
// ============================================================

function openGallery(index) {
  if (!galleryImages.length || !galleryModal || !modalImage) return;

  currentGalleryIndex = Math.max(
    0,
    Math.min(index, galleryImages.length - 1)
  );

  updateGalleryModal();

  galleryModal.classList.add("open");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGallery() {
  galleryModal?.classList.remove("open");
  galleryModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateGalleryModal() {
  if (!galleryImages.length || !modalImage) return;

  modalImage.src = galleryImages[currentGalleryIndex];

  if (modalCount) {
    modalCount.textContent =
      `${currentGalleryIndex + 1} / ${galleryImages.length}`;
  }
}

function previousImage() {
  if (!galleryImages.length) return;

  currentGalleryIndex =
    (currentGalleryIndex - 1 + galleryImages.length) %
    galleryImages.length;

  updateGalleryModal();
}

function nextImage() {
  if (!galleryImages.length) return;

  currentGalleryIndex =
    (currentGalleryIndex + 1) %
    galleryImages.length;

  updateGalleryModal();
}

modalClose?.addEventListener("click", closeGallery);
modalPrev?.addEventListener("click", previousImage);
modalNext?.addEventListener("click", nextImage);

galleryModal?.addEventListener("click", e => {
  if (e.target === galleryModal) closeGallery();
});

document.addEventListener("keydown", e => {
  if (!galleryModal?.classList.contains("open")) return;

  if (e.key === "Escape") closeGallery();
  if (e.key === "ArrowLeft") previousImage();
  if (e.key === "ArrowRight") nextImage();
});


// ============================================================
// MOBILE SWIPE
// ============================================================

let touchStartX = 0;
let touchStartY = 0;

galleryModal?.addEventListener(
  "touchstart",
  e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  },
  { passive: true }
);

galleryModal?.addEventListener(
  "touchend",
  e => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = touchStartX - endX;
    const dy = touchStartY - endY;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 45) return;

    if (dx > 0) nextImage();
    else previousImage();
  },
  { passive: true }
);

const weddingVideo = document.querySelector(".wedding-video video");

if (weddingVideo) {
  weddingVideo.playbackRate = 0.60;
}


// ============================================================
// COPY
// ============================================================

async function copyText(text, message = "복사되었습니다.") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    alert(message);
  } catch (error) {
    alert("복사에 실패했습니다.");
  }
}

document.querySelectorAll("[data-copy]").forEach(button => {
  button.addEventListener("click", () => {
    copyText(
      button.dataset.copy,
      "계좌번호가 복사되었습니다."
    );
  });
});


// ============================================================
// SHARE
// ============================================================

const shareData = {
  title: "이인원 ♥ 김지윤 결혼합니다",
  text: "2027.08.22 일요일 오후 12시 10분 · 라마다서울신도림호텔",
  url: location.href
};

document.getElementById("linkShare")?.addEventListener("click", () => {
  copyText(location.href, "청첩장 링크가 복사되었습니다.");
});

document.getElementById("kakaoShare")?.addEventListener("click", () => {
  // Kakao JavaScript SDK 연결 전에는 링크 복사로 동작합니다.
  copyText(
    location.href,
    "카카오톡에 붙여넣을 청첩장 링크가 복사되었습니다."
  );
});

document.getElementById("nativeShare")?.addEventListener("click", async () => {
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await copyText(
        location.href,
        "청첩장 링크가 복사되었습니다."
      );
    }
  } catch (error) {
    // user cancelled
  }
});


// ============================================================
// START
// ============================================================

discoverImages();
