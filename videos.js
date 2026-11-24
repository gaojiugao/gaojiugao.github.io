/**
 * ============================================================================
 *  @sunjay5968 个人 Vlog 网站配置文件 (零代码维护 + 支持自动同步)
 * ============================================================================
 *
 *  启用 GitHub Actions 全自动同步后，新发布的 YouTube 公开视频会自动合并到
 *  本文件的 `videos` 列表最前面，并重新发布网站。
 *
 *  你也可以随时直接在 GitHub 网页点开本文件修改：
 *  - 修改 `channel.tagline`（首屏一句话签名）和 `channel.bio`（关于频道简介）。
 *  - 想展示拍摄设备：取消 `gear` 里示例行的 `//` 注释并改成你的设备。
 *  - 想加 B站 / 小红书 / 邮箱链接：取消 `links` 里示例行的 `//` 注释并填好网址。
 *  - 调整某条视频的分类（"citywalk" | "events" | "lab"）或 location 标签。
 * ============================================================================
 */

window.VLOG_SITE = {
  channel: {
    name: "瘋狂的瑪利亞",
    handle: "@sunjay5968",
    channelId: "UC195XYpr1z9GW7tUJqGCnug",
    url: "https://www.youtube.com/@sunjay5968",
    subscribeUrl: "https://www.youtube.com/@sunjay5968?sub_confirmation=1",
    avatar:
      "https://yt3.googleusercontent.com/z9vqamho6OEm8_MDEz_cs_K6HF150heXS0S3dtFDkAeAJNAUUxWq5DGHQ8VYs55w3ifM2Vy6NV8=s900-c-k-c0x00ffffff-no-rj",
    joined: "2016.06",
    base: "SHANGHAI / VLOG",

    // ↓ 以下内容可按你的个人风格自由修改
    tagline: "用镜头记录城市肌理、街头漫步与自由影像实验。",
    bio: "这里是瘋狂的瑪利亞（@sunjay5968）的个人影像档案室。频道目前主要记录上海的城市漫步——从外滩、武康路、城隍庙与豫园，到海昌海洋公园和城市快闪现场，保留沉浸式的街景声音与步行节奏；同时也会不定期收录赛博朋克短片实验与观点杂谈。（可在 videos.js 中随时修改这段个人简介）",

    // ↓ 可选：拍摄设备清单。如要显示，删除对应行前的 "// " 即可
    gear: [
      // "DJI Osmo Pocket 4 Pro",
      // "4K Walkabout / Ambient Audio",
    ],

    // ↓ 可选：额外社媒或联系邮箱。如要显示，删除对应块前的 "// " 即可
    links: [
      // { label: "BILIBILI", url: "https://space.bilibili.com/你的UID" },
      // { label: "EMAIL", url: "mailto:yourname@example.com" },
    ],
  },

  categories: [
    { key: "all", label: "全部影片", en: "ALL REELS" },
    { key: "citywalk", label: "城市漫步", en: "SHANGHAI WALK" },
    { key: "events", label: "城市现场", en: "EVENTS" },
    { key: "lab", label: "实验与杂谈", en: "LAB & ESSAY" },
  ],

  meta: {
    lastSynced: "2026-11-24",
  },

  // 按发布时间从新到旧排列（已收录 @sunjay5968 目前全部 11 个 Public 公开视频）
  videos: [
    {
      url: "https://www.youtube.com/watch?v=iUvHGkQVy68",
      title: "上海靜安寺 · 南京西路",
      subtitle: "Jing'an Temple, Shanghai · Nanjing West Road",
      duration: "11:13",
      date: "2026-11-24",
      category: "citywalk",
      location: "SHANGHAI · JING'AN",
      featured: true,
    },
    {
      url: "https://www.youtube.com/watch?v=u4eZ-a3ik5Q",
      title: "上海新天地",
      subtitle: "Shanghai Pacific Xintiandi Commercial Center",
      duration: "2:21",
      date: "2026-11-24",
      category: "citywalk",
      location: "SHANGHAI · XINTIANDI",
    },
    {
      url: "https://www.youtube.com/watch?v=wKbsLMBil-U",
      title: "上海市人民廣場 人民公園",
      subtitle: "People's Square and People's Park in Shanghai Downtown",
      duration: "9:52",
      date: "2026-11-24",
      category: "citywalk",
      location: "SHANGHAI · PEOPLE'S SQ",
    },
    {
      url: "https://www.youtube.com/watch?v=-PScdQ2l-Vk",
      title: "上海市青浦區朱家角 盤龍天地",
      subtitle: "Panlong Tiandi, Zhujiajiao, Qingpu District, Shanghai",
      duration: "40:23",
      date: "2026-11-24",
      category: "citywalk",
      location: "SHANGHAI · ZHUJIAJIAO",
    },
    {
      url: "https://www.youtube.com/watch?v=uS_uOR_O6hk",
      title: "上海市外灘 和平飯店和上海之巔",
      subtitle: "The Bund, Peace Hotel and The Top of Shanghai",
      duration: "19:03",
      date: "2026-11-23",
      category: "citywalk",
      location: "SHANGHAI · THE BUND",
    },
    {
      url: "https://www.youtube.com/watch?v=acsUsX2PpGc",
      title: "上海市武康路",
      subtitle: "Shanghai Downtown Wukang Road",
      duration: "57:20",
      date: "2026-11-23",
      category: "citywalk",
      location: "SHANGHAI · WUKANG RD",
    },
    {
      url: "https://www.youtube.com/watch?v=YkAIznf2vCk",
      title: "上海市城隍廟和豫園",
      subtitle: "Shanghai Downtown God Temple and Yu Garden",
      duration: "55:48",
      date: "2026-11-22",
      category: "citywalk",
      location: "SHANGHAI · YU GARDEN",
    },
    {
      url: "https://www.youtube.com/watch?v=HmUQVdAnBqg",
      title: "上海海昌海洋公園",
      subtitle: "Shanghai Haichang Ocean Park",
      duration: "1:08:48",
      date: "2026-09-13",
      category: "citywalk",
      location: "SHANGHAI · LINGANG",
    },
    {
      url: "https://www.youtube.com/watch?v=gK6XELrF43Y",
      title: "比奇堡粉絲集結 上海靜安嘉里中心 浦東嘉里城",
      subtitle: "Residents of Bikini Bottom in Shanghai with Spongebob",
      duration: "7:13",
      date: "2026-08-23",
      category: "events",
      location: "SHANGHAI · KERRY CENTRE",
    },
    {
      url: "https://www.youtube.com/watch?v=ntWEf7ab8VQ",
      title: "賽博朋克世界之戰（Trial Version）",
      subtitle: "Cyberpunk Short · Trial Version",
      duration: "1:18",
      date: "2026-08-15",
      category: "lab",
      location: "SHORT FILM · LAB",
    },
    {
      url: "https://www.youtube.com/watch?v=fMoknRSTMoI",
      title: "反官僚主義的孫悟空？ 西遊記",
      subtitle: "Journey to the West · Commentary",
      duration: "3:37",
      date: "2026-07-12",
      category: "lab",
      location: "ESSAY · COMMENTARY",
    },
  ],
};
