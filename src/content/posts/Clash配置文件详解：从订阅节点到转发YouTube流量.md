---
title: Clash配置文件完全解析：从订阅到规则分流
published: 2025-02-16
description: 详细介绍Clash配置文件的结构和编写方法,包括DNS设置、规则集配置、代理组设置等,帮助你实现更精细的流量分流。
image: "./FILES/Clash配置文件详解：从订阅节点到转发YouTube流量.assets/img-20250216154906.png"
tags: ['Clash', '代理', '网络', '配置', '学习']
category: 学习笔记
draft: false
---

文件引用自：https://linux.do/t/topic/424805/17
<details>

<summary>
点击查看完整配置文件
</summary>

```js
// 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query" // 腾讯DoH，因腾讯云即将关闭免费版IP访问，故用域名
];
// 国外DNS服务器
const foreignNameservers = [
  // "https://8.8.4.4/dns-query#ecs=1.1.1.1/24&ecs-override=true", // GoogleDNS
  "https://1.1.1.1/dns-query", // CloudflareDNS
  // "https://208.67.222.222/dns-query#ecs=1.1.1.1/24&ecs-override=true", // OpenDNS
  "https://9.9.9.9/dns-query" //Quad9DNS
];
// DNS配置
const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",
  "ipv6": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    // 本地主机/设备
    "+.lan",
    "+.local",
    // // Windows网络出现小地球图标
    // "+.msftconnecttest.com",
    // "+.msftncsi.com",
    // QQ快速登录检测失败
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    // 微信快速登录检测失败
    "localhost.work.weixin.qq.com"
  ],
  "default-nameserver": ["https://223.5.5.5/dns-query"],
  "nameserver": [...foreignNameservers],
  "nameserver-policy": {
    "geosite:private,cn": domesticNameservers
  }
};
//分地区


// 规则集通用配置
const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 86400
};
// 规则集配置
const ruleProviders = {
  "reject": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    "path": "./ruleset/loyalsoldier/reject.yaml"
  },
  "icloud": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    "path": "./ruleset/loyalsoldier/icloud.yaml"
  },
  "apple": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    "path": "./ruleset/loyalsoldier/apple.yaml"
  },
  "google": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
    "path": "./ruleset/loyalsoldier/google.yaml"
  },
  "telegramcidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    "path": "./ruleset/loyalsoldier/telegramcidr.yaml"
  },
  "cncidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    "path": "./ruleset/loyalsoldier/cncidr.yaml"
  },
  "lancidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    "path": "./ruleset/loyalsoldier/lancidr.yaml"
  },
  "applications": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
    "path": "./ruleset/loyalsoldier/applications.yaml"
  },
  "openai": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
    "path": "./ruleset/blackmatrix7/openai.yaml"
  },
  "ehentai": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/ehentai",
    "path": "./ruleset/v2fly/ehentai.yaml"
  },
  "microsoft": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/microsoft",
    "path": "./ruleset/v2fly/microsoft.yaml"
  },
  "bing": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/bing",
    "path": "./ruleset/v2fly/bing.yaml"
  },
  "onedrive": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/onedrive",
    "path": "./ruleset/v2fly/onedrive.yaml"
  },
  "youtube": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/youtube",
    "path": "./ruleset/v2fly/youtube.yaml"
  },
  "netflix": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/netflix",
    "path": "./ruleset/v2fly/netflix.yaml"
  },
  "abema": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/abema",
    "path": "./ruleset/v2fly/abema.yaml"
  },
  "bahamut": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/bahamut",
    "path": "./ruleset/v2fly/bahamut.yaml"
  },
  "steam": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/v2fly/domain-list-community@master/data/steam",
    "path": "./ruleset/v2fly/steam.yaml"
  },
  "proxy": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    "path": "./ruleset/loyalsoldier/proxy.yaml"
  },
  "direct": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    "path": "./ruleset/loyalsoldier/direct.yaml"
  },
  "private": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    "path": "./ruleset/loyalsoldier/private.yaml"
  },
  "gfw": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    "path": "./ruleset/loyalsoldier/gfw.yaml"
  },
  "tld-not-cn": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    "path": "./ruleset/loyalsoldier/tld-not-cn.yaml"
  },
};
// 规则
const rules = [
  // 额外自定义规则       //在此添加你想要的规则
  "PROCESS-NAME,steam.exe,🎮 Steam",
  "DOMAIN,v2.ixlmo.net,🔗 Global Direct",
  // 自定义规则
  "DOMAIN-SUFFIX,googleapis.cn,⚙️ Node Select", // Google服务
  "DOMAIN-SUFFIX,gstatic.com,⚙️ Node Select", // Google静态资源
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,⚙️ Node Select", // Google Play下载服务
  "DOMAIN-SUFFIX,github.io,⚙️ Node Select", // Github Pages
  "DOMAIN,v2rayse.com,⚙️ Node Select", // V2rayse节点工具
  //Bilibili 港澳台
  "DOMAIN,p-bstarstatic.akamaized.net,📺 BilibiliHMT",
  "DOMAIN,p.bstarstatic.com,📺 BilibiliHMT",
  "DOMAIN,upos-bstar-mirrorakam.akamaized.net,📺 BilibiliHMT",
  "DOMAIN,upos-bstar1-mirrorakam.akamaized.net,📺 BilibiliHMT",
  "DOMAIN,upos-hz-mirrorakam.akamaized.net,📺 BilibiliHMT",
  // blackmatrix7 规则集
  "RULE-SET,openai,💸 ChatGPT",
  // Loyalsoldier 规则集
  "RULE-SET,applications,🔗 Global Direct",
  "RULE-SET,private,🔗 Global Direct",
  "RULE-SET,reject,🥰 AdBlock",
  "RULE-SET,icloud,🍎 iCloud",
  "RULE-SET,apple,🍎 Apple",
  "RULE-SET,google,📢 Google",
  "RULE-SET,telegramcidr,📲 Telegram,no-resolve",
  "RULE-SET,ehentai,🐼 E-Hentai,no-resolve",
  "RULE-SET,microsoft,Ⓜ️ Microsoft,no-resolve",
  "RULE-SET,bing,Ⓜ️ Bing,no-resolve",
  "RULE-SET,onedrive,Ⓜ️ Onedrive,no-resolve",
  "RULE-SET,youtube,📹 Youtube,no-resolve",
  "RULE-SET,netflix,🎥 Netflix,no-resolve",
  "RULE-SET,bahamut,📺 Bahamut,no-resolve",
  "RULE-SET,abema,📺 Abema,no-resolve",
  "RULE-SET,steam,🎮 Steam,no-resolve",
  "RULE-SET,proxy,⚙️ Node Select",
  "RULE-SET,gfw,⚙️ Node Select",
  "RULE-SET,tld-not-cn,⚙️ Node Select",
  "RULE-SET,direct,🔗 Global Direct",
  "RULE-SET,lancidr,🔗 Global Direct,no-resolve",
  "RULE-SET,cncidr,🔗 Global Direct,no-resolve",
  // 其他规则
  "GEOIP,LAN,🔗 Global Direct,no-resolve",
  "GEOIP,CN,🔗 Global Direct,no-resolve",
  "MATCH,🐟 Others"
];
// 代理组通用配置
const groupBaseOption = {
  "interval": 300,
  "timeout": 3000,
  "url": "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖原配置中DNS配置
  config["dns"] = dnsConfig;

  // 覆盖原配置中的代理组
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "⚙️ Node Select",
      "type": "select",
      "proxies": ["♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },
    {
      ...groupBaseOption,
      "name": "♻️ Latency Tuning",
      "type": "url-test",
      "tolerance": 50,
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },
    {
      ...groupBaseOption,
      "name": "🚑 Fallback",
      "type": "fallback",
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg"
    },
    {
      ...groupBaseOption,
      "name": "⚖️ Load Balance(Hashing)",
      "type": "load-balance",
      "strategy": "consistent-hashing",
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg"
    },
    {
      ...groupBaseOption,
      "name": "☁️ Load Balance(Round Robin)",
      "type": "load-balance",
      "strategy": "round-robin",
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg"
    },
    {
      ...groupBaseOption,
      "name": "🇭🇰Hong Kong",
      "type": "select",
      "include-all": true,
      "filter": "(?i)港|🇭🇰|hk|hongkong|hong kong",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/hk.svg"
    },
    {
      ...groupBaseOption,
      "name": "🇯🇵Japan",
      "type": "select",
      "include-all": true,
      "filter": "(?i)日本|🇯🇵|jp|japan",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/jp.svg"
    },
    {
      ...groupBaseOption,
      "name": "🇰🇷Korea",
      "type": "select",
      "include-all": true,
      "filter": "(?i)韩|🇰🇷|kr|korea",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/kr.svg"
    },
    {
      ...groupBaseOption,
      "name": "🇸🇬Singapore",
      "type": "select",
      "include-all": true,
      "filter": "(?i)新加坡|🇸🇬|sg|singapore",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/sg.svg"
    },
    {
      ...groupBaseOption,
      "name": "🇨🇳Taiwan",
      "type": "select",
      "include-all": true,
      "filter": "(?i)台湾|🇹🇼|tw|taiwan|tai wan",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/cn.svg"
    },
    {
      ...groupBaseOption,
      "name": "🇺🇸United States",
      "type": "select",
      "include-all": true,
      "filter": "(?i)美|🇺🇸|us|united state|america",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/us.svg"
    },
    {
      ...groupBaseOption,
      "name": "🇬🇧United Kingdom",
      "type": "select",
      "include-all": true,
      "filter": "(?i)英|🇬🇧|uk|united kingdom|great britain",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/gb.svg"
    },
    {
      ...groupBaseOption,
      "name": "📢 Google",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg"
    },
    {
      ...groupBaseOption,
      "name": "📲 Telegram",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg"
    },
    {
    ...groupBaseOption,
      "name": "🐼 E-Hentai",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://e-hentai.org/favicon.ico"
    },
    {
    ...groupBaseOption,
      "name": "Ⓜ️ Microsoft",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
    },
    {
    ...groupBaseOption,
      "name": "Ⓜ️ Bing",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bing.svg"
    },
    {
    ...groupBaseOption,
      "name": "Ⓜ️ Onedrive",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
    },
    {
    ...groupBaseOption,
      "name": "📹 Youtube",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
    },
    {
    ...groupBaseOption,
      "name": "🎥 Netflix",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/netflix.svg"
    },
    {
    ...groupBaseOption,
      "name": "📺 Bahamut",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://www.gamer.com.tw/favicon.ico"
    },
    {
    ...groupBaseOption,
      "name": "📺 Abema",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://abema.tv/favicon.ico"
    },
    {
    ...groupBaseOption,
      "name": "📺 BilibiliHMT",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://bilibili.com/favicon.ico"
    },
    {
    ...groupBaseOption,
      "name": "🎮 Steam",
      "type": "select",
      "proxies": ["🔗 Global Direct", "⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/steam.svg"
    },
    {
      ...groupBaseOption,
      "url": "https://chatgpt.com",
      "expected-status": "200",
      "name": "💸 ChatGPT",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "exclude-filter": "(?i)港|hk|hongkong|hong kong|俄|ru|russia|澳|macao",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg"
    },
    {
      ...groupBaseOption,
      "name": "🍎 iCloud",
      "type": "select",
      "proxies": ["⚙️ Node Select", "🔗 Global Direct", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
    },
    {
      ...groupBaseOption,
      "name": "🍎 Apple",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
    },
    {
      ...groupBaseOption,
      "name": "🥰 AdBlock",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg"
    },
    {
      ...groupBaseOption,
      "name": "🔗 Global Direct",
      "type": "select",
      "proxies": ["DIRECT", "⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
    },
    {
      ...groupBaseOption,
      "name": "❌ Global Reject",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg"
    },
    {
      ...groupBaseOption,
      "name": "🐬 Custom Direct",
      "type": "select",
      "proxies": ["🔗 Global Direct", "⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/unknown.svg"
    },
    {
      ...groupBaseOption,
      "name": "🐳 Custom Proxy",
      "type": "select",
      "include-all": true,
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/openwrt.svg"
    },
    {
      ...groupBaseOption,
      "name": "🐟 Others",
      "type": "select",
      "proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
    }
  ];

  // 覆盖原配置中的规则
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  config["proxies"].forEach(proxy => {
    // 为每个节点设置 udp = true
    proxy.udp = true
  })
  // 返回修改后的配置
  return config;
}
```

</details>

你是否好奇过,当你点击一个 YouTube 视频时,数据包是如何通过代理服务器传输的?或者为什么有时候某些网站特别慢,而换个节点就变快了?这篇文章将为你揭开 Clash 配置文件的神秘面纱,用最通俗的语言解释它是如何工作的。

我们会按照以下顺序,循序渐进地了解整个过程:
1. 配置文件是什么,它在整个代理过程中扮演什么角色
2. 如何从订阅链接获取可用的代理服务器
3. DNS 配置如何帮助你更快地访问网站
4. 规则如何决定你的访问请求走什么路径
5. 代理组是如何管理和分发节点的
6. 实际案例:访问 YouTube 的全过程

---

# Clash 配置文件详解：从订阅节点到转发 YouTube 流量

想象一下,配置文件就像是一本"说明书",它告诉 Clash 该如何处理你的网络请求:该用哪个服务器、要不要加速、是否要绕过某些网站等。本文将带你一步步理解这本"说明书"的内容,让你明白当你浏览网页时,数据包是如何被智能处理的。

---

## 1. 配置文件整体介绍

如果把 Clash 比作一个快递公司,那么这份配置文件就是快递分拣的规则手册。它告诉快递员(Clash)：
- 这个包裹(网络请求)要送到哪里
- 用什么路线最快(代理节点)
- 特殊包裹要如何处理(规则)
- 在哪些情况下需要绕路(分流)

这份配置文件使用 JavaScript 编写,主要完成以下工作:
- 检查你是否有可用的快递员(代理节点)
- 设置导航系统(DNS 配置)
- 制定派送路线(规则集和规则)
- 组建快递小组(代理组)
- 确保所有快递员都能处理特殊包裹(UDP 设置)

---

## 2. 如何获取订阅链接中的节点

订阅链接就像是一份快递员名单,里面包含了所有可以帮你送货的快递员信息(服务器地址、端口等)。当你在 Clash 中输入这个链接时,它会自动解析出所有可用的快递员。

让我们看看配置文件是如何处理这个名单的:

```js
const proxyCount = config?.proxies?.length ?? 0;
const proxyProviderCount = typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
if (proxyCount === 0 && proxyProviderCount === 0) {
  throw new Error("配置文件中未找到任何代理");
}
```

这段代码就是在检查:
1. 是否有直接可用的快递员(proxies)
2. 是否有可以联系到的快递公司(proxy-providers)
3. 如果两个都没有,就报错说"没有找到快递员"

当你导入订阅链接后,这些节点会被自动分配到不同的快递小组中(代理组)。配置文件中的 `include-all: true` 表示所有快递员都可以加入对应的小组。

---

## 3. DNS 配置与网站识别：以 YouTube 为例

### DNS 是什么？

DNS（域名解析系统）就像是互联网世界的"导航地图"。当你想访问一个网站时，DNS 会告诉你这个网站具体在哪里（IP地址）。

### 为什么需要特别配置 DNS？

想象你要寄两个包裹：
- 一个寄往北京（国内网站）
- 一个寄往纽约（国外网站）

你会发现：
- 问国内快递员北京地址 → 准确快速
- 问国内快递员纽约地址 → 可能不准确或找不到

所以我们需要：
- 国内地址 → 问国内快递员
- 国外地址 → 问国际快递员

### DNS 配置示例

```yaml
dns:
  enable: true
  enhanced-mode: "fake-ip"
  nameserver: # 国内 DNS 服务器
    - https://dns.alidns.com/dns-query # 阿里 DNS
    - https://doh.pub/dns-query        # DNSPod DNS
  
  fallback: # 国外 DNS 服务器
    - https://1.1.1.1/dns-query        # Cloudflare DNS
    - https://9.9.9.9/dns-query        # Quad9 DNS
  
  fallback-filter: # 识别规则
    geoip: true    # 使用地理位置数据库
    ipcidr:        # IP 地址范围
      - 240.0.0.0/4
```

### 如何识别国内外网站？

以访问 YouTube 为例，让我们看看完整的识别和解析过程：

1. **域名规则匹配**
```yaml
rules:
  - DOMAIN-SUFFIX,youtube.com,📹 Youtube
  - DOMAIN-SUFFIX,googlevideo.com,📹 Youtube
```
- Clash 发现访问的是 youtube.com
- 匹配到上述规则，确定是 YouTube 服务

2. **规则集验证**
```yaml
rule-providers:
  youtube:
    type: http
    behavior: domain
    url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/youtube.txt"
```
- 查询规则集确认这是 YouTube 相关域名
- 规则集中包含了完整的 YouTube 域名列表

3. **GeoSite 数据库查询**
```yaml
rules:
  - GEOSITE,youtube,📹 Youtube
```
- 通过 GeoSite 数据库再次确认
- 数据库显示这是国外网站

4. **选择合适的 DNS**
- 因为确定是国外网站
- 使用 fallback 中的国外 DNS（1.1.1.1 或 9.9.9.9）
- 避免使用可能被污染的国内 DNS

### 实际工作流程

当你在浏览器输入 youtube.com 时：

1. **请求捕获**
   - Clash 截获访问请求
   - 提取域名 youtube.com

2. **网站识别**
   - 通过规则匹配识别为 YouTube
   - 确定是国外网站
   - 需要使用代理访问

3. **DNS 解析**
   - 自动切换到国外 DNS（如 Cloudflare 1.1.1.1）
   - 获取 YouTube 的真实 IP 地址
   - 避免 DNS 污染问题

4. **建立连接**
   - 使用解析到的 IP 地址
   - 通过选定的代理节点访问

这样的设计确保了：
- 国内网站用国内 DNS → 访问更快
- 国外网站用国外 DNS → 解析更准确
- 自动识别和切换 → 体验更流畅

就像有两个导航系统：
- 国内导航 → 熟悉国内的路
- 国外导航 → 了解国外的路
- 系统自动选择合适的导航 → 永远不会迷路

---

## 4. 规则集和规则：如何让 Clash 知道该走哪条路

想象一下，Clash 就像一个智能的交通指挥官，需要知道不同的网站该走什么路。规则集就是他手中的"指挥手册"，告诉他该如何分配这些网络流量。

### 规则集是什么？

简单来说，规则集就是一个清单，告诉 Clash：
- 哪些网站需要代理（比如 YouTube、Google）
- 哪些网站直接访问（比如淘宝、百度）
- 每个网站该使用什么样的连接方式

就像快递公司的分拣指南：
- 国内包裹走普通快递
- 国际包裹走国际快递
- 特殊物品走特殊渠道

### 规则集是如何工作的？

配置文件通过 `ruleProviders` 来管理这些规则集：

```js
// 以 YouTube 为例
"RULE-SET,youtube,📹 Youtube,no-resolve"
```

这行配置的意思是：
1. 发现 YouTube 相关的网址
2. 交给 "📹 Youtube" 这个代理组处理
3. 不需要额外的地址解析（no-resolve）

### 为什么要这样设计？

这种设计有几个好处：

1. **自动更新**
   - 规则集会定期从网上下载最新版本
   - 就像导航软件会更新最新的路况信息

2. **模块化管理**
   - 不同类型的网站有不同的规则集
   - 就像快递公司对不同类型的包裹有不同的处理方式

3. **便于维护**
   - 规则变化时只需更新规则集
   - 用户不需要手动修改配置

### 实际工作流程

当你访问 YouTube 时：

1. **识别网站**
   - Clash 看到你访问的是 youtube.com
   - 查找规则集，发现这是 YouTube 相关网站

2. **选择路线**
   - 根据规则找到对应的代理组（📹 Youtube）
   - 在代理组中选择合适的节点

3. **建立连接**
   - 通过选定的节点访问 YouTube
   - 确保视频能够流畅播放

就像快递系统：
- 收到包裹（网络请求）
- 查看目的地（网站域名）
- 选择合适的快递员（代理节点）
- 送达目的地（访问网站）

## 5. 代理组：Clash 的智能调度系统

代理组就像是不同的快递小组，每个小组都有自己的特长：

1. **手动选择组**（select 类型）
   - 自己选择想用的节点
   - 就像指定特定的快递员

2. **自动测速组**（url-test 类型）
   - 自动选择最快的节点
   - 就像系统自动分配最空闲的快递员

3. **故障转移组**（fallback 类型）
   - 当前节点出问题自动换下一个
   - 就像快递员请假有替补上岗

4. **负载均衡组**（load-balance 类型）
   - 在多个节点之间分配流量
   - 就像多个快递员合作送同一个区域

每个代理组都可以设置：
- 包含哪些节点（proxies）
- 是否包含所有节点（include-all）
- 使用什么策略（type）

这样的设计确保了：
- 网络访问稳定可靠
- 自动选择最佳路线
- 出现问题能够自动处理

---

## 6. 流量转发全过程：当你点开 YouTube 视频时发生了什么？

让我们通过实际的配置代码，一步步看看当你访问 YouTube 时，Clash 是如何工作的。

### 第一步：DNS 解析

首先看看 DNS 配置:
```js
// 国外DNS服务器
const foreignNameservers = [
"https://1.1.1.1/dns-query", // CloudflareDNS
"https://9.9.9.9/dns-query" // Quad9DNS
];
```


当你输入 youtube.com 时:
1. Clash 捕获到这个域名
2. 发现是国外网站，使用 foreignNameservers
3. 通过 CloudflareDNS 或 Quad9DNS 解析出真实 IP

这就像在国外找房子，要问当地的人才知道准确地址。

### 第二步：规则匹配

看看 YouTube 的规则配置:
```js
{
...groupBaseOption,
"name": "📹 Youtube",
"type": "select",
"proxies": ["⚙️ Node Select", "♻️ Latency Tuning", "🚑 Fallback", "⚖️ Load Balance(Hashing)", "☁️ Load Balance(Round Robin)", "🔗 Global Direct", "🇭🇰Hong Kong", "🇯🇵Japan", "🇰🇷Korea", "🇸🇬Singapore", "🇨🇳Taiwan", "🇺🇸United States", "🇬🇧United Kingdom"],
"include-all": true,
"icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
}
```


节点选择过程:
1. 可以手动选择特定地区节点
2. 或使用自动策略:
   - ♻️ 自动选择延迟最低的节点
   - 🚑 当前节点故障自动切换
   - ⚖️ 在多个节点间平衡分配

就像有多个快递员，可以:
- 指定特定快递员送货
- 让系统自动选择最快的
- 或者多个快递员轮流送

### 第四步：流量转发

最后看看节点配置:
```js
config["proxies"].forEach(proxy => {
// 为每个节点设置 udp = true
proxy.udp = true
})
```


转发过程:
1. 选定节点后，建立连接
2. 开启 UDP 支持，确保视频流畅
3. 通过节点访问 YouTube 服务器
4. 将视频数据返回给你

就像快递员:
- 拿到包裹（你的请求）
- 选择最佳路线（代理节点）
- 送到目的地（YouTube 服务器）
- 把货物（视频数据）带回来

### 整个过程总结

当你想看 YouTube 视频时:
1. 输入网址 → DNS 解析获取真实地址
2. 规则匹配 → 确定使用 YouTube 代理组
3. 代理选择 → 找到最适合的节点
4. 流量转发 → 通过节点访问视频

所有这些都是自动完成的，你只需要:
1. 打开浏览器
2. 输入 YouTube 网址
3. 享受流畅的视频体验

这就是一个优秀的代理配置系统应该做到的：把复杂的事情变得简单，让用户专注于使用体验。

---

## 总结

整个配置文件的作用可以归纳为：

1. 检查是否正确导入了订阅节点（这些节点保存于 config.proxies 或 proxy-providers 中）。
2. 配置 DNS，确保国内外域名解析走不同的服务器，增强解析准确性和绕过污染。
3. 定义规则集以及具体规则，将各类网站（如 Google、YouTube、Netflix 等）按类别匹配到不同的代理组。
4. 定义代理组，通过手动选择、自动检测、负载均衡等策略，把所有订阅的节点分组，用户（或者规则）选择合适的节点。
5. 在访问 YouTube 时，Clash 通过 DNS 解析、规则匹配、模块化代理组选择，将数据流量转发到一个经过挑选的节点上，实现无障碍访问。

通过这份配置文件，你不仅学会了如何导入和使用订阅链接中的节点，还能根据实际需要制定不同的规则和代理组，实现对流量的智能分流。希望这篇文章能帮助你更好地理解和使用 Clash 的配置。 
