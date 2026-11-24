import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIDEOS_PATH = path.resolve(__dirname, "..", "videos.js");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const HEADER_COMMENT = `/**
 * ============================================================================
 *  @sunjay5968 个人 Vlog 网站配置文件 (零代码维护 + 自动同步)
 * ============================================================================
 *
 *  GitHub Actions 会定时检查 YouTube 公开更新，并自动将新视频增量合并到本文件。
 *  你也可以随时直接在 GitHub 网页点开本文件修改以下字段：
 *  - channel.tagline / channel.bio: 首屏签名与“关于频道”简介
 *  - channel.gear:  拍摄设备数组，例如 ["DJI Osmo Pocket 4 Pro"]
 *  - channel.links: 额外社媒数组，例如 [{ "label": "BILIBILI", "url": "https://..." }]
 *  - videos[].category: 可选 "citywalk" | "events" | "lab"
 *  - videos[].location: 卡片右下角胶片地点/主题标签
 * ============================================================================
 */
`;

function extractYouTubeId(input) {
  if (typeof input !== "string") return "";
  const raw = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const match = raw.match(re);
    if (match && match[1]) return match[1];
  }
  return "";
}

function decodeXmlEntities(str) {
  if (!str) return "";
  const named = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
  };
  return str.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (full, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : full;
    }
    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : full;
    }
    return Object.prototype.hasOwnProperty.call(named, entity) ? named[entity] : full;
  });
}

function formatShanghaiDate(isoStr) {
  const d = new Date(isoStr);
  if (!Number.isNaN(d.getTime())) {
    try {
      return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Shanghai",
      }).format(d);
    } catch {
      // Fallback below if ICU timezone data is unavailable
    }
  }
  return typeof isoStr === "string" ? isoStr.slice(0, 10) : "";
}

function formatDurationSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "";
  const sec = Math.round(totalSeconds);
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const rem = sec % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

function splitBilingualTitle(rawTitle) {
  const clean = (rawTitle || "").trim();
  const match = clean.match(
    /^([\s\S]*[\u3400-\u9FFF\uF900-\uFAFF])\s+([A-Za-z][A-Za-z0-9\s'’.,&·\-/:()]+)$/
  );
  if (match) {
    return {
      title: match[1].trim(),
      subtitle: match[2].trim(),
    };
  }
  return {
    title: clean,
    subtitle: "",
  };
}

function inferCategory(rawTitle) {
  if (
    /集結|集结|快閃|快闪|漫展|特展|粉絲|粉丝|嘉里|Festival|Expo|Pop-?up/i.test(
      rawTitle
    )
  ) {
    return "events";
  }
  if (
    /賽博|赛博|Trial|西遊記|西游记|影評|影评|雜談|杂谈|Essay|Commentary|Short/i.test(
      rawTitle
    )
  ) {
    return "lab";
  }
  return "citywalk";
}

function inferLocation(rawTitle, category) {
  if (/上海|Shanghai/i.test(rawTitle)) {
    return "SHANGHAI · VLOG";
  }
  if (category === "lab") {
    return "SHORT FILM · LAB";
  }
  return "YOUTUBE · VLOG";
}

async function fetchWithRetry(url, options = {}, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delayMs = attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

function parseRssEntries(xml) {
  const entries = [];
  const entryRegex = /<entry\b[^>]*>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const idMatch = block.match(/<yt:videoId>\s*([a-zA-Z0-9_-]{11})\s*<\/yt:videoId>/);
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const pubMatch = block.match(/<published>([\s\S]*?)<\/published>/);
    if (!idMatch || !titleMatch) continue;

    entries.push({
      id: idMatch[1].trim(),
      rawTitle: decodeXmlEntities(titleMatch[1].trim()),
      published: pubMatch ? pubMatch[1].trim() : "",
    });
  }
  return entries;
}

async function fetchDuration(videoId) {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&hl=en`;
  try {
    const response = await fetch(watchUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "CONSENT=YES+cb",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return "";
    const html = await response.text();

    const m1 = html.match(/"lengthSeconds":"(\d+)"/);
    if (m1 && m1[1]) {
      const formatted = formatDurationSeconds(Number.parseInt(m1[1], 10));
      if (formatted) return formatted;
    }

    const m2 = html.match(/"approxDurationMs":"(\d+)"/);
    if (m2 && m2[1]) {
      const secs = Math.round(Number.parseInt(m2[1], 10) / 1000);
      const formatted = formatDurationSeconds(secs);
      if (formatted) return formatted;
    }

    const m3 = html.match(
      /itemprop="duration"[^>]*content="PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?"/
    );
    if (m3) {
      const h = Number.parseInt(m3[1] || "0", 10);
      const m = Number.parseInt(m3[2] || "0", 10);
      const s = Number.parseInt(m3[3] || "0", 10);
      const formatted = formatDurationSeconds(h * 3600 + m * 60 + s);
      if (formatted) return formatted;
    }
  } catch (err) {
    console.warn(`Warning: failed to fetch duration for ${videoId}: ${err.message}`);
  }
  return "";
}

function setGitHubOutput(changed) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  fs.appendFileSync(outputPath, `changed=${changed ? "true" : "false"}\n`, "utf8");
}

async function main() {
  const prevRaw = fs.readFileSync(VIDEOS_PATH, "utf8");
  const context = { window: {} };
  vm.runInNewContext(prevRaw, context, { filename: "videos.js" });

  const site = context.window && context.window.VLOG_SITE;
  if (!site || !site.channel || !site.channel.channelId) {
    console.error("Error: videos.js must define window.VLOG_SITE.channel.channelId");
    process.exit(1);
  }

  const channelId = String(site.channel.channelId).trim();
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
    channelId
  )}`;
  console.log(`Fetching RSS feed for ${channelId}...`);

  const xml = await fetchWithRetry(rssUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  });

  const rssEntries = parseRssEntries(xml);
  console.log(`RSS returned ${rssEntries.length} public entries.`);

  const existingVideos = Array.isArray(site.videos)
    ? site.videos.map((v) => ({ ...v }))
    : [];
  const existingMap = new Map();
  for (const video of existingVideos) {
    const id = extractYouTubeId(video.url || video.id || "");
    if (id) {
      existingMap.set(id, video);
    }
  }

  const newVideos = [];
  const seenNew = new Set();

  for (const entry of rssEntries) {
    if (existingMap.has(entry.id) || seenNew.has(entry.id)) {
      continue;
    }
    seenNew.add(entry.id);

    const { title, subtitle } = splitBilingualTitle(entry.rawTitle);
    const category = inferCategory(entry.rawTitle);
    const location = inferLocation(entry.rawTitle, category);
    const date = formatShanghaiDate(entry.published);
    const duration = await fetchDuration(entry.id);

    newVideos.push({
      url: `https://www.youtube.com/watch?v=${entry.id}`,
      title,
      subtitle,
      duration,
      date,
      category,
      location,
    });
  }

  let durationsFilled = 0;
  for (const video of existingVideos) {
    const id = extractYouTubeId(video.url || video.id || "");
    if (!id) continue;
    const currentDur = typeof video.duration === "string" ? video.duration.trim() : "";
    if (!currentDur || currentDur === "--:--") {
      const resolved = await fetchDuration(id);
      if (resolved) {
        video.duration = resolved;
        durationsFilled += 1;
      }
    }
  }

  if (newVideos.length === 0 && durationsFilled === 0) {
    console.log("No new videos or missing durations found. videos.js left unchanged.");
    setGitHubOutput(false);
    return;
  }

  let mergedVideos = existingVideos;
  if (newVideos.length > 0) {
    mergedVideos = [...newVideos, ...existingVideos];
    for (let i = 0; i < mergedVideos.length; i++) {
      if (i === 0) {
        mergedVideos[i].featured = true;
      } else {
        delete mergedVideos[i].featured;
      }
    }
  }

  site.meta = {
    ...(site.meta && typeof site.meta === "object" ? site.meta : {}),
    lastSynced: formatShanghaiDate(new Date().toISOString()),
  };
  site.videos = mergedVideos;

  const nextRaw = `${HEADER_COMMENT}\nwindow.VLOG_SITE = ${JSON.stringify(site, null, 2)};\n`;
  const normalizedPrev = prevRaw.replace(/\r\n/g, "\n");

  if (normalizedPrev === nextRaw) {
    console.log("Serialized videos.js is identical to existing file.");
    setGitHubOutput(false);
    return;
  }

  fs.writeFileSync(VIDEOS_PATH, nextRaw, "utf8");
  console.log(
    `Updated videos.js: +${newVideos.length} new video(s), ${durationsFilled} duration(s) filled. Total: ${mergedVideos.length}.`
  );
  setGitHubOutput(true);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
