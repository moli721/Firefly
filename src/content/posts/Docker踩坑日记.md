---
title: Docker容器网络互联：ERR_CONNECTION_REFUSED排查记录
published: 2025-02-08
description: 遇到Docker容器之间网络连接问题？本文通过两个真实案例，深入分析Docker网络配置的常见坑点，手把手教你如何诊断和解决容器通信问题。
image: api
tags: ['Docker', '网络', '容器', '排查', '错误修复']
category: 避坑排查
draft: false
---

# Docker容器网络互联：踩坑记录与解决方案

> 📝 这是一份来自真实项目的踩坑笔记，记录了在使用Docker时遇到的网络问题及其解决方案。通过两个具体实例，帮助你理解和解决容器间的网络通信问题。


本文将通过两个实际案例来说明这些问题：
- 🔌 **案例一**：napcat反向WebSocket连接失败
- 🔗 **案例二**：newapi容器无法访问cursor-to-openai服务

## 一、背景简介

在使用 Docker 部署多个服务时，经常会遇到容器之间的网络隔离问题。不同的容器可能运行在不同的 Docker 网络中，容器内的 `127.0.0.1` 指向的是各自的内部环境，而不是宿主机或其它容器。这篇日记记录了我在部署 napcat（用于反向 WebSocket 连接）和 newapi（测试 HTTP 接口）时遇到的问题，以及如何排查和解决这些问题。

---

## 二、Docker 网络基础

### 1. Docker 默认网络类型

- **bridge 网络**  
  - 如果你没有指定网络，Docker 默认会将容器连接到名为 `bridge` 的网络中。
  - 容器可以通过 IP 通信，但默认无法通过容器名称互相访问。

- **用户自定义网络**  
  - 你可以使用命令 `docker network create <network_name>` 创建自定义网络（例如 `baota_net`）。
  - 在自定义网络中，容器间可以通过名称相互解析，非常方便。

### 2. 查看 Docker 网络信息

- **查看所有网络**  
  ```bash
  docker network ls
  ```
  输出示例：
  ```
  NETWORK ID     NAME        DRIVER    SCOPE
  487f8520966a   baota_net   bridge    local
  d2758aac9ad7   bridge      bridge    local
  e93f7b6bb2da   host        host      local
  2817ff9e258d   none        null      local
  ```

- **查看某个网络的详细信息**  
  比如查看 `baota_net` 网络：
  ```bash
  docker network inspect baota_net
  ```
  这会显示该网络的子网、网关以及当前有哪些容器连接到这个网络，并显示它们的 IP 地址。

- **快速查看所有容器的网络**  
  ```bash
  docker ps --format "{{.Names}} -> {{.Networks}}"
  ```
  例如，我得到的结果是：
  ```
  napcat -> bridge
  cursor-to-openai -> bridge
  newapi_by2f_new-api_1 -> baota_net
  newapi_by2f_redis_1 -> baota_net
  newapi_by2f_mysql_1 -> baota_net
  alist_7b4p_alist_7b4p_1 -> baota_net
  ```
  表示：
  - 部分容器（napcat、cursor-to-openai）运行在默认的 `bridge` 网络中；
  - 其他容器运行在自定义的 `baota_net` 网络中。

### 3. 关于主机网络接口

在 ifconfig 输出中你看到的 `ens17` 是宿主机上的网卡名称，它通常代表真实的网络接口（在本例中 IP 为 `172.16.0.24`）。这与 Docker 默认使用的 `docker0` 或其他桥接网络不同。我们在容器之间或容器与宿主机之间通信时，经常需要用到宿主机的实际 IP 地址。

---

## 三、实例分析

### 例子1：napcat 反向 WebSocket 连接失败

#### 问题描述：
- 在 napcat 的反向代理配置中设置了目标地址为 `ws://127.0.0.1:8080/onebot/v11/ws`。
- 日志显示错误：`connect ECONNREFUSED 127.0.0.1:8080`。

#### 原因分析：
- napcat 运行在 Docker 容器中，容器内的 `127.0.0.1` 指向的是 napcat 自己，而不是宿主机上的 NoneBot 服务。
- NoneBot 服务运行在宿主机或其他网络中，因而无法从 napcat 的容器内通过 `127.0.0.1` 访问。

#### 解决方案：
1. **使用宿主机 IP 地址**  
   根据 ifconfig，宿主机 IP 是 `172.16.0.24`，因此修改反向代理地址为：
   ```
   ws://172.16.0.24:8080/onebot/v11/ws
   ```
   这样 napcat 容器就能通过宿主机网络正确连接到 NoneBot 服务。

2. **或者使用 host.docker.internal**  
   如果 Docker 版本支持，在 napcat 容器启动时添加映射：
   ```bash
   docker run --add-host=host.docker.internal:host-gateway ...
   ```
   然后配置反向代理地址为：
   ```
   ws://host.docker.internal:8080/onebot/v11/ws
   ```

### 例子2：newapi 容器测试配置失败

#### 问题描述：
- newapi 容器尝试访问 cursor-to-openai 服务时，填写 `http://127.0.0.1:3010` 导致连接超时（i/o timeout）。
- cursor-to-openai 运行在 bridge 网络中，并通过端口映射将 3010 暴露给宿主机。

#### 原因分析：
- 在 newapi 容器中，`127.0.0.1` 指的是 newapi 自己，而 cursor-to-openai 服务运行在另外一个容器中。
- 使用宿主机 IP（例如 `172.16.0.24:3010`）也不一定能成功，因为 newapi 容器与宿主机之间可能存在路由或网络隔离问题。

#### 解决方案：
1. **让两个容器处于同一网络**  
   将 cursor-to-openai 容器加入到 newapi 容器所在的网络（比如都加入 `baota_net`）。操作命令：
   ```bash
   docker network connect baota_net cursor-to-openai
   ```
   然后，在 newapi 中通过容器名直接访问：
   ```
   http://cursor-to-openai:3010/v1/chat/completions
   ```
   这种方法让容器之间直接通信，避免了跨网络或通过宿主机访问时出现的超时问题。

2. **使用宿主机地址并配置 host.docker.internal**  
   如果不方便让容器处于同一网络，可以在 newapi 容器启动时添加：
   ```bash
   --add-host=host.docker.internal:host-gateway
   ```
   然后在 newapi 中使用：
   ```
   http://host.docker.internal:3010/v1/chat/completions
   ```
   这种方式让 newapi 通过特殊域名访问宿主机映射的服务端口。

---

## 四、总结与经验分享

1. **Docker 网络知识点**  
   - Docker 默认会创建多个网络，如 `bridge`、`host`、`none`，以及你手动创建的自定义网络（如 `baota_net`）。
   - 容器的 `127.0.0.1` 只指向自身，不同容器间不能用它直接通信。

2. **如何查看和管理网络**  
   - 使用 `docker network ls` 列出所有网络。
   - 使用 `docker network inspect <network>` 查看详细信息，包括连接的容器及其 IP。
   - 使用 `docker ps --format "{{.Names}} -> {{.Networks}}"` 快速查看各容器所在网络。

3. **跨容器通信技巧**  
   - 尽量让需要互联的容器加入同一自定义网络，便于使用容器名通信。
   - 如果必须通过宿主机访问，使用宿主机实际 IP 或配置 `host.docker.internal`，并注意防火墙和路由问题。

4. **实例教训**  
   - **napcat 反向连接失败**：原来使用 `127.0.0.1` 错误理解了容器内的网络环境，正确的方法是使用宿主机 IP 或 host.docker.internal。
   - **newapi 配置失败**：通过调整容器网络，将服务容器加入同一网络，成功解决了超时问题。
