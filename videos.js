/**
 * ============================================================================
 *  @sunjay5968 个人 Vlog 网站配置文件 (零代码维护入口)
 * ============================================================================
 *
 *  以后更新网站，只需要修改这一个文件，不需要动任何 HTML 或 CSS！
 *
 *  【如何添加新的 YouTube 视频】
 *  1. 在下面的 `videos: [` 列表中，复制最上面那一组 `{ ... },` 代码块。
 *  2. 粘贴到列表最前面（让新视频排在第一条）。
 *  3. 修改以下几项：
 *     - url:      直接粘贴 YouTube 完整链接（如 https://www.youtube.com/watch?v=... 或 https://youtu.be/...）或 11 位视频 ID
 *     - title:    视频主标题
 *     - subtitle: 英文副标题或一句话补充（不想写可以留空 ""）
 *     - duration: 时长，格式 "分:秒" 或 "时:分:秒"
 *     - date:     发布日期，格式 "YYYY-MM-DD"
 *     - category: 分类编号，可选 "citywalk" | "events" | "lab"（对应下方 categories）
 *     - location: 右侧胶片标签文字，可写拍摄地点或主题
 *     - featured: 把最想放在首页“主监视器”置顶播放的那一条设为 true，其余不写或设为 false
 *
 *  【如何修改个人介绍 / 设备清单 / 其他社媒链接】
 *  - 修改 `channel.tagline`（首屏一句话签名）和 `channel.bio`（关于频道的两段简介）。
 *  - 想展示拍摄设备：取消 `gear` 里示例行的 `//` 注释并改成你的设备。
 *  - 想加 B站 / 小红书 / 邮箱链接：取消 `links` 里示例行的 `//` 注释并填好网址。
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

  // 按发布时间从新到旧排列（已收录 @sunjay5968 目前全部 7 个 Public 公开视频）
  videos: [
    {
      url: "https://www.youtube.com/watch?v=uS_uOR_O6hk",
      title: "上海市外灘 和平飯店和上海之巔",
      subtitle: "The Bund, Peace Hotel and The Top of Shanghai",
      duration: "19:03",
      date: "2026-11-23",
      category: "citywalk",
      location: "SHANGHAI · THE BUND",
      featured: true,
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
