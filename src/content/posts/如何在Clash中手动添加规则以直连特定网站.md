---
title: 如何在Clash中手动添加规则以直连特定网站
published: 2025-03-25
description: 本文详细介绍了如何在Clash代理工具中添加自定义规则，让特定网站流量走直连，解决某些网站在开启代理后无法访问的问题，并解释了ruleProviders的作用与使用方法。
image: "./FILES/Clash配置文件详解：从订阅节点到转发YouTube流量.assets/img-20250216154906.png"
tags: ['Clash','网络配置']
category: 网络工具
draft: false
---

## 博客文章：如何在 Clash 中手动添加规则以直连特定网站

### 前言

最近在使用 Clash 代理时，我遇到一个问题：开启代理后，访问某些网站时会被拒绝进入。仔细一想，可能是这些网站检测到我的流量走了代理节点，不允许通过代理访问。为了解决这个问题，我决定手动在 Clash 配置中添加规则，让这些网站的流量直连（不走代理）。在这个过程中，我还对 `ruleProviders`（规则集）产生了好奇——它是什么？谁提供的？怎么用？跟自己写的规则有什么区别？接下来，我将把疑问和解决过程记录下来，分享给大家。

---

### 问题背景

我在 Clash 中订阅了一个代理配置，节点运行正常，但访问下面两个网址时却出了问题：

1. `http://10.17.8.18/a79.htm?userip=10.21.246.78&wlanacname=&wlanacip=10.17.4.1&usermac=f3feecd18354f7cc87b23ed50cb58a7871db97133f303b3b`
2. `https://new.clivia.fun/`

打开代理后，这些网站要么加载失败，要么直接提示无法访问。原因很可能是网站要求流量必须直连，而不是通过代理节点。为了正常访问，我需要调整 Clash 的规则，让这些网址的流量绕过代理，走直连模式。

---

### 解决方法：手动添加直连规则

在 Clash 中，流量的路由是通过 `rules`（规则）来控制的。Clash 会从上到下依次检查规则列表，找到第一个匹配的规则，然后根据规则指定的策略（比如 `DIRECT` 表示直连，`PROXY` 表示走代理）处理流量。

为了让特定网站直连，我需要在规则列表的**开头**添加直连规则，确保这些流量优先匹配到 `DIRECT` 策略。

#### 针对内网 IP 地址

第一个网址的域名部分是一个内网 IP 地址 `10.17.8.18`，我可以用 `IP-CIDR` 规则来匹配它：

```yaml
- IP-CIDR,10.17.8.18/32,DIRECT
```

- **`IP-CIDR`**：匹配 IP 地址范围的规则。
- **`10.17.8.18/32`**：精确匹配单个 IP 地址（`/32` 表示子网掩码，只包含这一个 IP）。
- **`DIRECT`**：表示直连，不走代理。

#### 针对域名

第二个网址是 `new.clivia.fun`，我可以用 `DOMAIN` 规则来精确匹配它：

```yaml
- DOMAIN,new.clivia.fun,DIRECT
```

- **`DOMAIN`**：匹配完整域名的规则。
- **`new.clivia.fun`**：目标域名。
- **`DIRECT`**：直连策略。

#### 修改后的规则列表

我在 Clash 配置文件中，将这两条规则添加到 `rules` 数组的开头，确保它们优先于其他规则被匹配：

```javascript
config["rules"] = [
    "IP-CIDR,10.17.8.18/32,DIRECT",
    "DOMAIN,new.clivia.fun,DIRECT",
    // 其他原有规则...
];
```

保存配置后重启 Clash，问题解决了！这两个网址的流量不再走代理，访问恢复正常。

---

### 未来如何添加更多直连网址

如果以后还有其他网站需要直连，只需按照类似方法，在 `rules` 开头添加新规则。Clash 支持多种规则类型，比如：

- **单个 IP 地址**：`IP-CIDR,<IP地址>/32,DIRECT`
- **单个域名**：`DOMAIN,<域名>,DIRECT`
- **域名关键字**：`DOMAIN-KEYWORD,<关键字>,DIRECT`（匹配包含关键字的域名）
- **域名后缀**：`DOMAIN-SUFFIX,<域名后缀>,DIRECT`（匹配某后缀的所有域名）

例如，想让 `example.com` 直连：

```yaml
- DOMAIN,example.com,DIRECT
```

---

### 关于 `ruleProviders` 的疑问解答

在研究规则时，我注意到配置文件中还有一个 `ruleProviders` 的部分，这是什么呢？下面我来详细解释。

#### `ruleProviders` 是什么？

简单来说，`ruleProviders` 是 Clash 中用于从外部获取规则集的功能。这些规则集通常是一些预定义的规则文件，由第三方或开源社区提供和维护，包含大量规则，能应对更广泛的场景，比如屏蔽广告、处理局域网流量等。

#### `ruleProviders` 的配置示例

我的配置文件中有这样的内容：

```javascript
"ruleProviders": {
    "LocalAreaNetwork": {
        "type": "http",
        "format": "yaml",
        "interval": 86400,
        "behavior": "classical",
        "url": "https://raw.githubusercontent.com/tnnevol/ACL4SSR/refs/heads/master/ClashVerge/dist/clash-rules/acl4ssr-online-full/LocalAreaNetwork.txt",
        "path": "./ruleset/tnnevol/LocalAreaNetwork.yaml"
    },
    "BanAD": {
        "type": "http",
        "format": "yaml",
        "interval": 86400,
        "behavior": "classical",
        "url": "https://raw.githubusercontent.com/tnnevol/ACL4SSR/refs/heads/master/ClashVerge/dist/clash-rules/acl4ssr-online-full/BanAD.txt",
        "path": "./ruleset/tnnevol/BanAD.yaml"
    }
}
```

- **`url`**：规则集的下载地址，Clash 会定期从这里获取最新的规则文件。
- **`path`**：规则文件下载后保存的本地路径，Clash 从这里加载规则。
- **`interval`**：更新间隔（单位秒，这里是 86400 秒，即 24 小时）。
- **`type` 和 `format`**：指定规则来源类型（HTTP）和格式（YAML）。

#### 谁提供的？

这些规则集通常由开源社区或 Clash 用户维护，比如 GitHub 上的项目（如上面的 `tnnevol/ACL4SSR`）。它们是公开的，任何人都可以使用或贡献规则。

#### 怎么调用？

在 `rules` 中，可以通过 `RULE-SET` 关键字引用这些规则集。例如：

```yaml
- RULE-SET,LocalAreaNetwork,DIRECT
- RULE-SET,BanAD,REJECT
```

- **`RULE-SET`**：表示引用一个外部规则集。
- **`LocalAreaNetwork`**：规则集的名称，对应 `ruleProviders` 中的键名。
- **`DIRECT` 或 `REJECT`**：应用到匹配流量的策略（直连或拒绝）。

这表示：
- 匹配 `LocalAreaNetwork` 规则集的流量（通常是局域网地址）走直连。
- 匹配 `BanAD` 规则集的流量（广告域名）被拒绝连接。

#### 跟自己写的规则有什么区别？

- **手动添加的规则**：
  - 由我自己编写，针对特定需求（比如让某个网站直连）。
  - 数量少，维护简单，但功能有限。
- **`ruleProviders` 的规则集**：
  - 由他人提供，规则数量多，覆盖面广（比如广告屏蔽、局域网优化）。
  - 通过网络动态更新，省去手动调整的麻烦，但不够灵活。

简单来说，手动规则适合个性化需求，而 `ruleProviders` 更适合通用场景。

---

### 总结

通过手动添加 `IP-CIDR` 和 `DOMAIN` 规则，我成功让特定网站的流量直连，解决了访问受阻的问题。同时，我也搞清楚了 `ruleProviders` 的作用：它通过外部规则集扩展了 Clash 的功能，让流量管理更省心。

希望这篇文章能帮到有类似困惑的朋友！如果你也遇到网站访问问题，不妨试试手动添加规则，或者利用 `ruleProviders` 优化你的 Clash 配置。

---

### 附录：Clash 规则优先级

Clash 的规则是从上到下匹配的，顺序很重要：
- **靠前的规则优先匹配**：所以直连规则要放在开头。
- **默认规则放最后**：比如 `MATCH,PROXY`，作为"兜底"策略处理未匹配的流量。

---
