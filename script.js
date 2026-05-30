// DOM SELECTORS: lay cac phan tu HTML can dieu khien bang JS
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const leadForm = document.querySelector("[data-lead-form]");
const formStatus = document.querySelector("[data-form-status]");
const videoCard = document.querySelector("[data-video-card]");
const videoModal = document.querySelector("[data-video-modal]");
const closeVideoButtons = document.querySelectorAll("[data-close-video]");
const countdown = document.querySelector("[data-countdown]");
const countdownHours = document.querySelector("[data-countdown-hours]");
const countdownMinutes = document.querySelector("[data-countdown-minutes]");
const countdownSeconds = document.querySelector("[data-countdown-seconds]");
const clinicalCarousel = document.querySelector("[data-clinical-carousel]");
const clinicalTrack = document.querySelector("[data-clinical-track]");
const clinicalDots = document.querySelector("[data-clinical-dots]");
const clinicalPrev = document.querySelector("[data-clinical-prev]");
const clinicalNext = document.querySelector("[data-clinical-next]");
const clinicalNoteTag = document.querySelector("[data-clinical-note-tag]");
const clinicalNoteTitle = document.querySelector("[data-clinical-note-title]");
const clinicalNoteDesc = document.querySelector("[data-clinical-note-desc]");

// MENU MOBILE: mo/dong menu tren man hinh nho
if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// FORM DOI TAC: gui du lieu ve Google Apps Script / Google Sheet
if (leadForm && formStatus) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!leadForm.checkValidity()) {
      leadForm.reportValidity();
      return;
    }

    const formData = new FormData(leadForm);

    // Lay du lieu tu form va gom dia chi thanh mot chuoi day du.
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const business = String(formData.get("business") || "").trim();
    const addressLine = String(formData.get("addressLine") || "").trim();
    const ward = String(formData.get("ward") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const submittedAt = new Date();
    const address = [addressLine, ward, city].filter(Boolean).join(", ");
    const content = [`Tên cơ sở: ${business}`, message && `Nội dung: ${message}`].filter(Boolean).join(" | ");
    const endpoint = leadForm.dataset.endpoint || leadForm.action;
    const submitButton = leadForm.querySelector('button[type="submit"]');
    const payload = new URLSearchParams();

    // Giu lai tat ca truong goc trong form.
    formData.forEach((value, key) => {
      payload.append(key, String(value));
    });

    // Mapping truong tieng Anh: phong truong hop Apps Script doc key khong dau.
    payload.set("name", name);
    payload.set("phone", phone);
    payload.set("address", address);
    payload.set("service", service);
    payload.set("message", content || message);
    payload.set("formId", "p9-perfect-skin");
    payload.set("pageUrl", window.location.href);
    payload.set("consent", formData.has("consent") ? "yes" : "no");
    payload.set("submittedAt", submittedAt.toISOString());
    payload.set("source", "P9 landing page");

    // Mapping dung ten cot Google Sheet hien tai.
    payload.set("Họ tên", name);
    payload.set("Số điện thoại", phone);
    payload.set("Địa chỉ", address);
    payload.set("Dịch vụ", service);
    payload.set("Nội dung", content || message);
    payload.set("Form ID", "p9-perfect-skin");
    payload.set("Trang gửi", window.location.href);
    payload.set("Submitted at", submittedAt.toISOString());
    payload.set("Thời gian", submittedAt.toLocaleString("vi-VN", { hour12: false }));

    formStatus.textContent = "Đang gửi thông tin, vui lòng chờ...";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      formStatus.textContent = `${name || "Cảm ơn bạn"}, thông tin đã được gửi. Đội ngũ P9 sẽ liên hệ tư vấn triển khai tại cơ sở.`;
      leadForm.reset();
    } catch (error) {
      formStatus.textContent = "Chưa gửi được thông tin. Vui lòng kiểm tra kết nối và thử lại.";
      console.error("Lead form submission failed:", error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}

// VIDEO MODAL: mo popup video.
const openVideo = () => {
  if (!videoModal) {
    return;
  }

  videoModal.hidden = false;
  document.body.style.overflow = "hidden";
};

// VIDEO MODAL: dong popup video.
const closeVideo = () => {
  if (!videoModal) {
    return;
  }

  videoModal.hidden = true;
  document.body.style.overflow = "";
};

if (videoCard) {
  videoCard.addEventListener("click", openVideo);
}

closeVideoButtons.forEach((button) => {
  button.addEventListener("click", closeVideo);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVideo();
  }
});

// COUNTDOWN SALE: dem nguoc toi 00:00 cua ngay hien tai.
const padTime = (value) => String(value).padStart(2, "0");

const getNextMidnight = () => {
  const deadline = new Date();
  deadline.setHours(24, 0, 0, 0);
  return deadline;
};

const updateCountdown = () => {
  if (!countdown || !countdownHours || !countdownMinutes || !countdownSeconds) {
    return;
  }

  const remaining = Math.max(0, getNextMidnight().getTime() - Date.now());
  const hours = Math.floor(remaining / 1000 / 60 / 60);
  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  countdownHours.textContent = padTime(hours);
  countdownMinutes.textContent = padTime(minutes);
  countdownSeconds.textContent = padTime(seconds);

  countdown.classList.remove("is-ticking");
  window.requestAnimationFrame(() => countdown.classList.add("is-ticking"));
};

updateCountdown();
window.setInterval(updateCountdown, 1000);

// CA LAM SANG: fallback note neu HTML khong co data-case-*.
const clinicalCaseNotes = [
  {
    tag: "Ca lâm sàng 01",
    title: "Nền da xỉn màu, kết cấu da không đều",
    desc: "Theo dõi sau 7 ngày chăm sóc nền da với P9.",
  },
  {
    tag: "Ca lâm sàng 02",
    title: "Da thiếu ẩm, bề mặt da kém mịn",
    desc: "Theo dõi sau 14 ngày, ghi nhận độ mềm và độ bóng khỏe bề mặt.",
  },
  {
    tag: "Ca lâm sàng 03",
    title: "Lỗ chân lông nhìn thô, da thiếu sức sống",
    desc: "Theo dõi sau 21 ngày trong quy trình chăm sóc định kỳ.",
  },
  {
    tag: "Ca lâm sàng 04",
    title: "Nền da sau chăm sóc cần duy trì",
    desc: "Theo dõi sau 28 ngày, kết hợp hướng dẫn dưỡng và chống nắng.",
  },
];

// CA LAM SANG: cap nhat note theo ca dang hien thi.
const updateClinicalNote = (pageIndex, page) => {
  const fallbackNote = clinicalCaseNotes[pageIndex % clinicalCaseNotes.length];
  const caseSlide = page?.querySelector(".clinical-slide");
  const note = {
    tag: caseSlide?.dataset.caseTag || fallbackNote.tag,
    title: caseSlide?.dataset.caseTitle || fallbackNote.title,
    desc: caseSlide?.dataset.caseDesc || fallbackNote.desc,
  };

  if (clinicalNoteTag) {
    clinicalNoteTag.textContent = note.tag;
  }

  if (clinicalNoteTitle) {
    clinicalNoteTitle.textContent = note.title;
  }

  if (clinicalNoteDesc) {
    clinicalNoteDesc.textContent = note.desc;
  }
};

// CA LAM SANG: gom moi 2 figure thanh 1 trang slider.
const createClinicalPage = (slides) => {
  const page = document.createElement("div");
  page.className = "clinical-page";
  page.append(...slides);
  return page;
};

// CA LAM SANG: khoi tao slider, dots, nut truoc/sau va autoplay.
const initClinicalCarousel = () => {
  if (!clinicalCarousel || !clinicalTrack || !clinicalDots || !clinicalPrev || !clinicalNext) {
    return;
  }

  const existingSlides = Array.from(clinicalTrack.querySelectorAll(".clinical-slide"));

  // Moi ca duoc khai bao truc tiep trong HTML; moi 2 figure lien tiep thanh 1 trang.
  const slideItems = existingSlides;

  clinicalTrack.innerHTML = "";

  for (let index = 0; index < slideItems.length; index += 2) {
    clinicalTrack.append(createClinicalPage(slideItems.slice(index, index + 2)));
  }

  const pages = Array.from(clinicalTrack.querySelectorAll(".clinical-page"));
  const slides = Array.from(clinicalTrack.querySelectorAll(".clinical-slide"));
  const autoplayMs = Number(clinicalCarousel.dataset.autoplayMs || 3500);
  let activeIndex = 0;
  let autoplayTimer;

  if (!pages.length) {
    return;
  }

  const renderDots = () => {
    clinicalDots.innerHTML = "";

    pages.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Xem cặp ảnh lâm sàng ${index + 1}`);
      dot.addEventListener("click", () => {
        showPage(index);
        restartAutoplay();
      });
      clinicalDots.append(dot);
    });
  };

  // An nut/dots neu chi co 1 ca.
  const updateControls = () => {
    const shouldHideControls = pages.length <= 1;
    clinicalPrev.hidden = shouldHideControls;
    clinicalNext.hidden = shouldHideControls;
    clinicalDots.hidden = shouldHideControls;
  };

  // Hien ca theo index va cap nhat note/dots.
  const showPage = (index) => {
    activeIndex = (index + pages.length) % pages.length;
    clinicalTrack.style.transform = `translateX(-${activeIndex * 100}%)`;

    pages.forEach((page, pageIndex) => {
      page.classList.toggle("is-active", pageIndex === activeIndex);
    });

    updateClinicalNote(activeIndex, pages[activeIndex]);

    slides.forEach((slide) => {
      const page = slide.closest(".clinical-page");
      slide.classList.toggle("is-active", page?.classList.contains("is-active"));
    });

    Array.from(clinicalDots.children).forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  };

  const nextPage = () => showPage(activeIndex + 1);
  const prevPage = () => showPage(activeIndex - 1);

  // Autoplay slider; stopAutoplay duoc goi truoc de tranh chong timer.
  const startAutoplay = () => {
    stopAutoplay();

    if (pages.length <= 1) {
      return;
    }

    autoplayTimer = window.setInterval(nextPage, autoplayMs);
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  clinicalPrev.addEventListener("click", () => {
    prevPage();
    restartAutoplay();
  });

  clinicalNext.addEventListener("click", () => {
    nextPage();
    restartAutoplay();
  });

  renderDots();
  updateControls();
  showPage(0);
  startAutoplay();
};

initClinicalCarousel();
