(function () {
  "use strict";

  var data = window.VLOG_SITE;
  if (!data || !data.channel || !Array.isArray(data.videos)) {
    return;
  }

  var STORAGE_KEY = "sunjay5968_theme";
  var isLocalFile = window.location.protocol === "file:";

  function byId(id) {
    return document.getElementById(id);
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeExternalUrl(url, allowMailto) {
    if (typeof url !== "string") return "";
    var trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (allowMailto && /^mailto:/i.test(trimmed)) return trimmed;
    return "";
  }

  function extractYouTubeId(input) {
    if (typeof input !== "string") return "";
    var raw = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
      return raw;
    }
    var patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = raw.match(patterns[i]);
      if (m && m[1]) return m[1];
    }
    return "";
  }

  function parseDurationSeconds(str) {
    if (typeof str !== "string") return 0;
    var parts = str.trim().split(":").map(function (p) {
      return parseInt(p, 10);
    });
    if (
      parts.some(function (n) {
        return Number.isNaN(n) || n < 0;
      })
    ) {
      return 0;
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }

  function formatTotalRuntime(totalSeconds) {
    var hrs = Math.floor(totalSeconds / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;
    return pad2(hrs) + ":" + pad2(mins) + ":" + pad2(secs);
  }

  function attachThumbnail(img, videoId) {
    if (!img || !videoId) return;
    var candidates = [
      {
        src: "https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg",
        crop43: false,
      },
      {
        src: "https://i.ytimg.com/vi/" + videoId + "/sddefault.jpg",
        crop43: true,
      },
      {
        src: "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg",
        crop43: true,
      },
    ];
    var step = 0;

    function applyCandidate(idx) {
      var candidate = candidates[idx];
      img.classList.toggle("thumb-crop-43", candidate.crop43);
      img.src = candidate.src;
    }

    function advance() {
      step += 1;
      if (step < candidates.length) {
        applyCandidate(step);
      } else {
        img.removeEventListener("error", advance);
        img.removeEventListener("load", handleLoad);
      }
    }

    function handleLoad() {
      // YouTube returns a 120x90 grey placeholder when maxresdefault is missing
      if (img.naturalWidth <= 120 && step < candidates.length - 1) {
        advance();
      }
    }

    img.addEventListener("error", advance);
    img.addEventListener("load", handleLoad);
    applyCandidate(0);
  }

  function createYouTubeIframe(videoId, title) {
    var iframe = document.createElement("iframe");
    iframe.className = "embed-frame";
    iframe.src =
      "https://www.youtube.com/embed/" +
      encodeURIComponent(videoId) +
      "?autoplay=1&rel=0&modestbranding=1";
    iframe.title = title || "YouTube video player";
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    );
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.allowFullscreen = true;
    return iframe;
  }

  // Normalize videos with canonical reel numbers & watch URLs
  var videos = data.videos
    .map(function (item, idx) {
      var id = extractYouTubeId(item.url || item.id || "");
      var watchUrl = id
        ? "https://www.youtube.com/watch?v=" + id
        : safeExternalUrl(item.url) || data.channel.url;
      return {
        index: idx,
        reelCode: pad2(idx + 1),
        id: id,
        url: watchUrl,
        title: item.title || "未命名影片",
        subtitle: item.subtitle || "",
        duration: item.duration || "--:--",
        seconds: parseDurationSeconds(item.duration || ""),
        date: item.date || "",
        category: item.category || "citywalk",
        location: item.location || "YOUTUBE",
        featured: Boolean(item.featured),
      };
    })
    .filter(function (v) {
      return Boolean(v.id);
    });

  var categories = Array.isArray(data.categories) && data.categories.length
    ? data.categories
    : [{ key: "all", label: "全部影片", en: "ALL REELS" }];

  var categoryLabelMap = {};
  categories.forEach(function (cat) {
    categoryLabelMap[cat.key] = cat.label;
  });

  var defaultFeatured = videos.findIndex(function (v) {
    return v.featured;
  });

  var state = {
    activeCategory: "all",
    viewMode: "grid",
    featuredIndex: defaultFeatured >= 0 ? defaultFeatured : 0,
    featuredPlaying: false,
    modalList: videos,
    modalIndex: null,
    lastFocusedEl: null,
  };

  // DOM References
  var els = {
    headerBrandName: byId("headerBrandName"),
    headerBrandHandle: byId("headerBrandHandle"),
    themeToggle: byId("themeToggle"),
    themeToggleLabel: byId("themeToggleLabel"),
    headerYoutubeLink: byId("headerYoutubeLink"),

    channelAvatar: byId("channelAvatar"),
    channelAvatarFallback: byId("channelAvatarFallback"),
    channelName: byId("channelName"),
    channelHandle: byId("channelHandle"),
    channelTagline: byId("channelTagline"),
    statTotalReels: byId("statTotalReels"),
    statTotalRuntime: byId("statTotalRuntime"),
    statJoined: byId("statJoined"),
    statBase: byId("statBase"),
    heroSubscribeBtn: byId("heroSubscribeBtn"),

    monitorReelCode: byId("monitorReelCode"),
    monitorDuration: byId("monitorDuration"),
    monitorDate: byId("monitorDate"),
    monitorYoutubeLink: byId("monitorYoutubeLink"),
    monitorStage: byId("monitorStage"),
    monitorTitle: byId("monitorTitle"),
    monitorSubtitle: byId("monitorSubtitle"),
    monitorPrev: byId("monitorPrev"),
    monitorNext: byId("monitorNext"),
    monitorLocalHint: byId("monitorLocalHint"),
    monitorLocalHintLink: byId("monitorLocalHintLink"),

    archiveCount: byId("archiveCount"),
    filterBar: byId("filterBar"),
    viewToggle: byId("viewToggle"),
    videoCatalog: byId("videoCatalog"),

    aboutBio: byId("aboutBio"),
    aboutGearBlock: byId("aboutGearBlock"),
    aboutGearList: byId("aboutGearList"),
    dossierChannelId: byId("dossierChannelId"),
    dossierHandle: byId("dossierHandle"),
    dossierUrl: byId("dossierUrl"),
    dossierPublicCount: byId("dossierPublicCount"),
    aboutExtraLinks: byId("aboutExtraLinks"),
    dossierYoutubeBtn: byId("dossierYoutubeBtn"),
    footerMeta: byId("footerMeta"),
    footerSyncNote: byId("footerSyncNote"),

    playerModal: byId("playerModal"),
    modalBackdrop: byId("modalBackdrop"),
    modalReelCode: byId("modalReelCode"),
    modalDuration: byId("modalDuration"),
    modalDate: byId("modalDate"),
    modalYoutubeLink: byId("modalYoutubeLink"),
    modalClose: byId("modalClose"),
    modalStage: byId("modalStage"),
    modalTitle: byId("modalTitle"),
    modalSubtitle: byId("modalSubtitle"),
    modalLocation: byId("modalLocation"),
    modalPrev: byId("modalPrev"),
    modalNext: byId("modalNext"),
    modalLocalHint: byId("modalLocalHint"),
    modalLocalHintLink: byId("modalLocalHintLink"),
  };

  function getFilteredVideos() {
    if (state.activeCategory === "all") {
      return videos;
    }
    return videos.filter(function (v) {
      return v.category === state.activeCategory;
    });
  }

  function hydrateChannelInfo() {
    var ch = data.channel;
    var channelUrl = safeExternalUrl(ch.url) || "https://www.youtube.com/@sunjay5968";
    var subscribeUrl = safeExternalUrl(ch.subscribeUrl) || channelUrl;
    var avatarUrl = safeExternalUrl(ch.avatar);

    els.headerBrandName.textContent = ch.name || "";
    els.headerBrandHandle.textContent = ch.handle || "";
    els.headerYoutubeLink.href = channelUrl;

    els.channelName.textContent = ch.name || "";
    els.channelHandle.textContent = ch.handle || "";
    els.channelTagline.textContent = ch.tagline || "";
    els.heroSubscribeBtn.href = subscribeUrl;

    if (avatarUrl) {
      els.channelAvatar.addEventListener("error", function () {
        els.channelAvatar.hidden = true;
        els.channelAvatarFallback.hidden = false;
      });
      els.channelAvatar.src = avatarUrl;
      els.channelAvatar.alt = (ch.name || "频道") + " 头像";
    } else {
      els.channelAvatar.hidden = true;
      els.channelAvatarFallback.hidden = false;
    }

    var totalSeconds = videos.reduce(function (acc, item) {
      return acc + item.seconds;
    }, 0);

    els.statTotalReels.textContent = pad2(videos.length);
    els.statTotalRuntime.textContent = formatTotalRuntime(totalSeconds);
    els.statJoined.textContent = ch.joined || "—";
    els.statBase.textContent = ch.base || "VLOG";

    els.aboutBio.textContent = ch.bio || "";
    els.dossierChannelId.textContent = ch.channelId || "—";
    els.dossierHandle.textContent = ch.handle || "—";
    els.dossierUrl.href = channelUrl;
    els.dossierUrl.textContent = channelUrl.replace(/^https?:\/\/(www\.)?/, "");
    els.dossierPublicCount.textContent = pad2(videos.length) + " VIDEOS";
    els.dossierYoutubeBtn.href = channelUrl;
    els.footerMeta.textContent =
      "© " + new Date().getFullYear() + " " + (ch.name || "") + " · " + (ch.handle || "");
    if (els.footerSyncNote && data.meta && data.meta.lastSynced) {
      els.footerSyncNote.textContent =
        "AUTO-SYNCED " + data.meta.lastSynced + " · GITHUB PAGES STATIC ARCHIVE";
    }

    if (Array.isArray(ch.gear) && ch.gear.length > 0) {
      els.aboutGearList.innerHTML = ch.gear
        .map(function (item) {
          return '<li class="gear-item">' + escapeHtml(item) + "</li>";
        })
        .join("");
      els.aboutGearBlock.hidden = false;
    }

    if (Array.isArray(ch.links) && ch.links.length > 0) {
      var validLinks = ch.links.filter(function (link) {
        return link && link.label && safeExternalUrl(link.url, true);
      });
      if (validLinks.length > 0) {
        els.aboutExtraLinks.innerHTML = validLinks
          .map(function (link) {
            var safeHref = safeExternalUrl(link.url, true);
            return (
              '<a class="extra-link-chip mono" href="' +
              escapeHtml(safeHref) +
              '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(link.label) +
              " ↗</a>"
            );
          })
          .join("");
        els.aboutExtraLinks.hidden = false;
      }
    }
  }

  function renderHeroMonitor() {
    if (videos.length === 0) return;
    var video = videos[state.featuredIndex] || videos[0];

    els.monitorReelCode.textContent =
      "REEL " + video.reelCode + " / " + pad2(videos.length);
    els.monitorDuration.textContent = video.duration;
    els.monitorDate.textContent = video.date;
    els.monitorYoutubeLink.href = video.url;
    els.monitorLocalHintLink.href = video.url;
    els.monitorTitle.textContent = video.title;
    els.monitorSubtitle.textContent = video.subtitle || video.location;

    els.monitorStage.innerHTML = "";
    if (state.featuredPlaying) {
      els.monitorStage.appendChild(createYouTubeIframe(video.id, video.title));
      els.monitorLocalHint.hidden = !isLocalFile;
      return;
    }

    els.monitorLocalHint.hidden = true;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "poster-btn";
    btn.setAttribute("aria-label", "播放影片：" + video.title);

    var img = document.createElement("img");
    img.className = "poster-img";
    img.alt = video.title;
    attachThumbnail(img, video.id);

    var scrim = document.createElement("span");
    scrim.className = "poster-scrim";
    scrim.setAttribute("aria-hidden", "true");

    var brackets = document.createElement("span");
    brackets.className = "viewfinder-brackets";
    brackets.setAttribute("aria-hidden", "true");
    brackets.innerHTML =
      '<span class="vf-corner vf-tl"></span>' +
      '<span class="vf-corner vf-tr"></span>' +
      '<span class="vf-corner vf-bl"></span>' +
      '<span class="vf-corner vf-br"></span>';

    var plaque = document.createElement("span");
    plaque.className = "play-plaque mono";
    plaque.innerHTML =
      '<span class="play-plaque-led" aria-hidden="true">▶</span>' +
      "<span>PLAY REEL " +
      escapeHtml(video.reelCode) +
      "</span>";

    btn.appendChild(img);
    btn.appendChild(scrim);
    btn.appendChild(brackets);
    btn.appendChild(plaque);
    btn.addEventListener("click", function () {
      state.featuredPlaying = true;
      renderHeroMonitor();
    });

    els.monitorStage.appendChild(btn);
  }

  function renderFilterBar() {
    var counts = { all: videos.length };
    videos.forEach(function (v) {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });

    els.filterBar.innerHTML = categories
      .map(function (cat) {
        var isActive = state.activeCategory === cat.key;
        var count = counts[cat.key] || 0;
        return (
          '<button type="button" role="tab" class="filter-tab' +
          (isActive ? " is-active" : "") +
          '" data-category="' +
          escapeHtml(cat.key) +
          '" aria-selected="' +
          (isActive ? "true" : "false") +
          '">' +
          '<span class="filter-led" aria-hidden="true"></span>' +
          '<span class="filter-label">' +
          escapeHtml(cat.label) +
          "</span>" +
          '<span class="filter-count mono">' +
          pad2(count) +
          "</span>" +
          "</button>"
        );
      })
      .join("");
  }

  function buildGridMarkup(list) {
    return (
      '<div class="video-grid">' +
      list
        .map(function (v, filteredIdx) {
          var catName = categoryLabelMap[v.category] || v.category;
          return (
            '<article class="video-card" data-video-id="' +
            escapeHtml(v.id) +
            '">' +
            '<div class="card-media">' +
            '<button type="button" class="card-thumb-btn" data-open-modal="' +
            filteredIdx +
            '" aria-label="播放 ' +
            escapeHtml(v.title) +
            '">' +
            '<img class="card-thumb" data-thumb-id="' +
            escapeHtml(v.id) +
            '" alt="' +
            escapeHtml(v.title) +
            '" loading="lazy" />' +
            '<span class="viewfinder-brackets" aria-hidden="true">' +
            '<span class="vf-corner vf-tl"></span>' +
            '<span class="vf-corner vf-tr"></span>' +
            '<span class="vf-corner vf-bl"></span>' +
            '<span class="vf-corner vf-br"></span>' +
            "</span>" +
            '<span class="reel-badge mono">REEL ' +
            escapeHtml(v.reelCode) +
            "</span>" +
            '<span class="timecode-pill mono">' +
            escapeHtml(v.duration) +
            "</span>" +
            "</button>" +
            "</div>" +
            '<div class="card-body">' +
            '<div class="card-meta-row mono">' +
            "<span>" +
            escapeHtml(v.date) +
            "</span>" +
            '<span class="card-cat-tag">' +
            escapeHtml(catName) +
            "</span>" +
            "</div>" +
            '<button type="button" class="card-title-btn" data-open-modal="' +
            filteredIdx +
            '">' +
            '<h3 class="card-title">' +
            escapeHtml(v.title) +
            "</h3>" +
            "</button>" +
            (v.subtitle
              ? '<p class="card-subtitle">' + escapeHtml(v.subtitle) + "</p>"
              : "") +
            '<div class="card-footer">' +
            '<span class="card-location mono">' +
            escapeHtml(v.location) +
            "</span>" +
            '<div class="card-actions">' +
            '<button type="button" class="card-play-btn mono" data-open-modal="' +
            filteredIdx +
            '">▶ 播放</button>' +
            '<a class="card-yt-link mono" href="' +
            escapeHtml(v.url) +
            '" target="_blank" rel="noopener noreferrer" aria-label="在 YouTube 观看 ' +
            escapeHtml(v.title) +
            '">YT ↗</a>' +
            "</div>" +
            "</div>" +
            "</div>" +
            "</article>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildIndexMarkup(list) {
    return (
      '<div class="tape-index">' +
      '<div class="tape-index-head mono">' +
      "<span>REEL</span>" +
      "<span>PROGRAM / TITLE</span>" +
      '<span class="tape-col-location">LOCATION</span>' +
      "<span>DATE</span>" +
      "<span>DURATION</span>" +
      '<span style="text-align:right">ACTION</span>' +
      "</div>" +
      list
        .map(function (v, filteredIdx) {
          return (
            '<div class="tape-row">' +
            '<span class="tape-col-reel mono">#' +
            escapeHtml(v.reelCode) +
            "</span>" +
            '<div class="tape-col-title">' +
            '<div class="tape-thumb-wrap">' +
            '<img class="tape-thumb" data-thumb-id="' +
            escapeHtml(v.id) +
            '" alt="" loading="lazy" />' +
            "</div>" +
            '<button type="button" class="tape-title-btn" data-open-modal="' +
            filteredIdx +
            '">' +
            '<span class="tape-title-text">' +
            escapeHtml(v.title) +
            "</span>" +
            (v.subtitle
              ? '<span class="tape-subtitle-text mono">' +
                escapeHtml(v.subtitle) +
                "</span>"
              : "") +
            "</button>" +
            "</div>" +
            '<span class="tape-col-location mono">' +
            escapeHtml(v.location) +
            "</span>" +
            '<span class="tape-col-date mono">' +
            escapeHtml(v.date) +
            "</span>" +
            '<span class="tape-col-duration mono">' +
            escapeHtml(v.duration) +
            "</span>" +
            '<div class="tape-col-actions">' +
            '<button type="button" class="card-play-btn mono" data-open-modal="' +
            filteredIdx +
            '">▶ 播放</button>' +
            '<a class="card-yt-link mono" href="' +
            escapeHtml(v.url) +
            '" target="_blank" rel="noopener noreferrer">YT ↗</a>' +
            "</div>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderCatalog() {
    var list = getFilteredVideos();
    els.archiveCount.textContent =
      "SHOWING " + pad2(list.length) + " / " + pad2(videos.length);

    if (list.length === 0) {
      els.videoCatalog.innerHTML =
        '<div class="catalog-empty mono">当前分类暂无影片 / NO REELS IN THIS CATEGORY</div>';
      return;
    }

    els.videoCatalog.innerHTML =
      state.viewMode === "index"
        ? buildIndexMarkup(list)
        : buildGridMarkup(list);

    var imgs = els.videoCatalog.querySelectorAll("img[data-thumb-id]");
    imgs.forEach(function (img) {
      attachThumbnail(img, img.getAttribute("data-thumb-id"));
    });
  }

  function syncModalView() {
    var list = state.modalList;
    if (state.modalIndex === null || !list || !list[state.modalIndex]) {
      return;
    }

    var video = list[state.modalIndex];
    els.modalReelCode.textContent = "REEL " + video.reelCode + " / " + pad2(videos.length);
    els.modalDuration.textContent = video.duration;
    els.modalDate.textContent = video.date;
    els.modalYoutubeLink.href = video.url;
    els.modalLocalHintLink.href = video.url;
    els.modalLocation.textContent = video.location;
    els.modalTitle.textContent = video.title;
    els.modalSubtitle.textContent = video.subtitle || "";
    els.modalLocalHint.hidden = !isLocalFile;

    els.modalStage.innerHTML = "";
    els.modalStage.appendChild(createYouTubeIframe(video.id, video.title));
  }

  function openModal(filteredIdx, triggerEl) {
    var list = getFilteredVideos();
    if (!list[filteredIdx]) return;

    // Pause hero embed if active so two players don't overlap audio
    if (state.featuredPlaying) {
      state.featuredPlaying = false;
      renderHeroMonitor();
    }

    state.lastFocusedEl = triggerEl || document.activeElement;
    state.modalList = list;
    state.modalIndex = filteredIdx;

    els.playerModal.hidden = false;
    document.body.style.overflow = "hidden";
    syncModalView();
    els.modalClose.focus();
  }

  function closeModal() {
    if (state.modalIndex === null) return;
    state.modalIndex = null;
    els.modalStage.innerHTML = "";
    els.playerModal.hidden = true;
    document.body.style.overflow = "";

    if (
      state.lastFocusedEl &&
      typeof state.lastFocusedEl.focus === "function"
    ) {
      state.lastFocusedEl.focus();
    }
    state.lastFocusedEl = null;
  }

  function stepModal(delta) {
    if (state.modalIndex === null || !state.modalList.length) return;
    var len = state.modalList.length;
    state.modalIndex = (state.modalIndex + delta + len) % len;
    syncModalView();
  }

  function syncThemeLabel() {
    var current = document.documentElement.getAttribute("data-theme") || "paper";
    els.themeToggleLabel.textContent = current.toUpperCase();
  }

  function bindEvents() {
    els.themeToggle.addEventListener("click", function () {
      var current =
        document.documentElement.getAttribute("data-theme") || "paper";
      var next = current === "paper" ? "darkroom" : "paper";
      document.documentElement.setAttribute("data-theme", next);
      syncThemeLabel();
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (err) {
        /* ignore storage restrictions */
      }
    });

    els.monitorPrev.addEventListener("click", function () {
      if (!videos.length) return;
      state.featuredIndex =
        (state.featuredIndex - 1 + videos.length) % videos.length;
      state.featuredPlaying = false;
      renderHeroMonitor();
    });

    els.monitorNext.addEventListener("click", function () {
      if (!videos.length) return;
      state.featuredIndex = (state.featuredIndex + 1) % videos.length;
      state.featuredPlaying = false;
      renderHeroMonitor();
    });

    els.filterBar.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-category]");
      if (!btn) return;
      var nextCat = btn.getAttribute("data-category");
      if (!nextCat || nextCat === state.activeCategory) return;
      state.activeCategory = nextCat;
      renderFilterBar();
      renderCatalog();
    });

    els.viewToggle.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-view]");
      if (!btn) return;
      var nextView = btn.getAttribute("data-view");
      if (!nextView || nextView === state.viewMode) return;
      state.viewMode = nextView;
      els.viewToggle.querySelectorAll("button[data-view]").forEach(function (el) {
        var active = el.getAttribute("data-view") === nextView;
        el.classList.toggle("is-active", active);
        el.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderCatalog();
    });

    els.videoCatalog.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-open-modal]");
      if (!trigger) return;
      var idx = parseInt(trigger.getAttribute("data-open-modal"), 10);
      if (!Number.isNaN(idx)) {
        openModal(idx, trigger);
      }
    });

    els.modalClose.addEventListener("click", closeModal);
    els.modalBackdrop.addEventListener("click", closeModal);
    els.modalPrev.addEventListener("click", function () {
      stepModal(-1);
    });
    els.modalNext.addEventListener("click", function () {
      stepModal(1);
    });

    document.addEventListener("keydown", function (event) {
      if (state.modalIndex === null) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepModal(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepModal(1);
      }
    });
  }

  hydrateChannelInfo();
  syncThemeLabel();
  renderHeroMonitor();
  renderFilterBar();
  renderCatalog();
  bindEvents();
})();
