---
title: Nonebot2 Linux环境配置踩坑笔记：代理设置与文件处理
published: 2025-02-10
description: 记录在 Linux 服务器上配置 Nonebot2 机器人时遇到的常见问题，包括系统代理配置、文件权限设置等部署过程中的各种坑点及解决方案。
image: ""
tags: ['Nonebot2', 'Linux', 'QQ机器人', '踩坑笔记']
category: QQ机器人
draft: false
---

# Nonebot2 插件踩坑笔记：代理设置与文件处理

## 引言

在 Nonebot2 插件开发中，网络请求和文件处理是两个常见的痛点。最近在维护插件时，遇到了几个典型问题：httpx 代理设置改变、图片发送失败等。本文将分享这些问题的解决方案，希望能帮助大家少走弯路。

## 一、httpx 代理设置更新

### 1. 问题起因

最近很多使用 `httpx.AsyncClient` 的插件突然报错：
```python
AsyncClient.__init__() got an unexpected keyword argument 'proxies'
```

这是因为 httpx 库更新后改变了代理设置的方式。让我们看看如何修复这个问题。

### 2. 实际案例分析

#### 2.1 nonebot_plugin_cp_broadcast插件的更新

**更新前**：
```python
async def req_get(url: URLTypes, proxies: Optional[ProxiesTypes] = None) -> str:
    async with AsyncClient(proxies=proxies) as client:
        r: Response = await client.get(url)
    return r.content.decode("utf-8")
```

**更新后**：
```python
async def req_get(url: URLTypes, proxies: Optional[ProxiesTypes] = None) -> str:
    try:
        transport = AsyncHTTPTransport(proxy=proxies["http"] if proxies else None)
        async with AsyncClient(transport=transport) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.text
    except Exception as e:
        logger.error(f"请求失败: {e}")
        return ""
```

#### 2.2 nonebot_plugin_picstatus 插件的更新

**更新前**：
```python
@bg_provider()
async def loli():
    async with AsyncClient(
        follow_redirects=True,
        proxies=config.proxy,
        timeout=config.ps_req_timeout,
    ) as cli:
        return resp_to_bg_data(
            (await cli.get("https://www.loliapi.com/acg/pe/")).raise_for_status(),
        )
```

**更新后**：
```python
@bg_provider()
async def loli():
    transport = AsyncHTTPTransport(proxy=config.proxy if config.proxy else None)
    async with AsyncClient(
        transport=transport,
        follow_redirects=True,
        timeout=config.ps_req_timeout
    ) as cli:
        resp = await cli.get("https://www.loliapi.com/acg/pe/")
        resp.raise_for_status()
        return resp_to_bg_data(resp)
```

## 二、nonebot-plugin-nai3 插件踩坑实录

### 1. 遇到的问题

在开发过程中遇到了两个主要问题：

```python
# 问题一：代理设置错误
httpx.ProxyError: 代理连接失败

# 问题二：图片发送失败
ActionFailed(retcode=1200, message='文件名解析失败')
```

### 2. 解决过程

#### 2.1 代理问题修复

```python
# 更新前
proxies = {"http://": nai3_config.nai3_proxy}

# 更新后
proxies = {
    "http://": nai3_config.nai3_proxy,
    "https://": nai3_config.nai3_proxy
}
transport = AsyncHTTPTransport(proxy=proxies["https://"] if proxies else None)
```

#### 2.2 图片发送问题

尝试了多种方案：

1. **直接路径**（失败）：
```python
await nai3.send(MessageSegment.image(f"file:///{temp_path}"))
```

2. **相对路径**（失败）：
```python
await nai3.send(MessageSegment.image("./data/nai3/temp.png"))
```

3. **Base64 方案**（成功）：
```python
import base64
with open(temp_path, "rb") as f:
    image_data = f.read()
    base64_str = base64.b64encode(image_data).decode()
await nai3.send(
    f"种子: {seed}\n" + MessageSegment.image(f"base64://{base64_str}"), 
    at_sender=True
)
```

## 三、最佳实践与解决方案

### 1. 代理设置通用模板

```python
from httpx import AsyncClient, AsyncHTTPTransport
from typing import Optional

async def make_request(url: str, proxy: Optional[str] = None):
    transport = AsyncHTTPTransport(proxy=proxy if proxy else None)
    try:
        async with AsyncClient(transport=transport) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.text
    except Exception as e:
        logger.error(f"请求失败: {e}")
        return None
```

### 2. 图片发送最佳实践

```python
async def send_image(bot, event, image_path: str):
    try:
        # 首先尝试直接发送
        await bot.send(event, MessageSegment.image(f"file:///{image_path}"))
    except Exception as e:
        logger.debug(f"直接发送失败: {e}")
        # 失败则使用 base64
        try:
            with open(image_path, "rb") as f:
                base64_str = base64.b64encode(f.read()).decode()
            await bot.send(event, MessageSegment.image(f"base64://{base64_str}"))
        except Exception as e:
            logger.error(f"图片发送完全失败: {e}")
            raise
```

### 3. 错误处理与日志记录

```python
try:
    # 网络请求
    transport = AsyncHTTPTransport(proxy=proxy if proxy else None)
    async with AsyncClient(transport=transport) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        
    # 文件处理
    with open(temp_path, "wb") as f:
        f.write(resp.content)
        
    # 消息发送
    await send_image(bot, event, temp_path)
        
except httpx.HTTPError as e:
    logger.error(f"HTTP 请求失败: {e}")
except IOError as e:
    logger.error(f"文件操作失败: {e}")
except ActionFailed as e:
    logger.error(f"消息发送失败: {e}")
except Exception as e:
    logger.error(f"未知错误: {e}")
```

### 4. 文件权限检查

```bash
$ ls -la /opt/mybot/data/nai3
total 592
drwxr-xr-x 2 root root   4096 Feb 10 02:04 .
drwxr-xr-x 7 root root   4096 Feb  9 04:38 ..
-rwxr-xr-x 1 root root     35 Feb  9 03:13 black_data.json
-rwxr-xr-x 1 root root 591515 Feb 10 03:43 temp.png
```

权限说明：
- `drwxr-xr-x`: 目录权限，所有者可读写执行，其他用户可读执行
- `-rwxr-xr-x`: 文件权限，所有者可读写执行，其他用户可读执行

## 四、经验总结

### 1. 代理设置注意事项
- 使用新版 AsyncHTTPTransport
- 同时配置 http 和 https
- 检查代理地址格式
- 做好错误处理

### 2. 图片处理要点
- 优先使用 base64 方式
- 检查文件权限
- 做好异常处理
- 添加详细日志

### 3. 调试技巧
- 使用详细的日志记录
- 分步骤排查问题
- 准备多个备选方案
- 注意检查文件权限

## 五、常见问题解答

1. **Q: 为什么要更改代理设置方式？**
   A: 新的方式提供了更好的灵活性和可控性，允许更细粒度的传输层配置。

2. **Q: 为什么图片发送会失败？**
   A: 可能是路径解析问题、权限问题或 go-cqhttp 的限制，使用 base64 方式最可靠。

3. **Q: 代理设置要注意什么？**
   A: 需要同时设置 http 和 https，使用新版的 AsyncHTTPTransport 方式。

4. **Q: 如何调试文件权限问题？**
   A: 使用 `ls -la` 命令查看详细权限，确保运行用户有正确的读写权限。

## 结语

通过这些实际案例的分享，我们看到了在 Nonebot2 插件开发中常见的一些问题和解决方案。良好的错误处理和日志记录是排查问题的关键，而使用正确的代理设置和文件处理方式则是避免问题的基础。

希望这篇文章能帮助大家在开发过程中少走弯路。如果你有任何问题或经验分享，欢迎在评论区讨论！

## 参考资料
- [httpx 官方文档](https://www.python-httpx.org/)
- [Nonebot2 文档](https://v2.nonebot.dev/)