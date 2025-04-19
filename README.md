# Cloudflare Workers SOCKS5 代理中转

这个项目可以帮你通过 Cloudflare Workers 中转 SOCKS5 代理流量，利用 Cloudflare 的全球网络提供更稳定的连接体验。

## 项目简介

- 将你的 SOCKS5 代理服务通过 Cloudflare 全球网络中转
- 支持用户名/密码认证
- 通过 HTTPS/WSS 加密传输
- 使用 Workers KV 存储配置信息

## 部署步骤

### 1. 准备工作

先把代码下载到本地：

```bash
git clone https://github.com/w10lhx/socks5-proxy.git
cd socks5-proxy
npm install
```

### 2. 创建 KV 存储空间

运行下面的命令创建一个存储配置信息的 KV：

```bash
wrangler kv:namespace create "PROXY_CONFIG"
```

命令执行后会显示一个 ID，记下来备用。

### 3. 修改配置文件

编辑 `wrangler.toml` 文件，把刚才的 KV ID 填进去：

```toml
kv_namespaces = [
  { binding = "PROXY_CONFIG", id = "这里填入你的 KV ID" }
]
```

根据需要修改其他配置项，比如 `name` 和 `account_id`。你可以在 Cloudflare 控制面板右侧找到 account_id。

### 4. 部署到 Cloudflare

执行以下命令部署：

```bash
wrangler deploy
```

部署成功后，你会得到一个 Worker 域名（类似 `https://你的项目名.你的子域名.workers.dev`）。

## 配置代理信息

### 1. 打开配置页面

在浏览器中访问 `https://你的Worker域名/config`

### 2. 输入代理信息

在配置页面中填写以下信息：

- **用户名**：你的 SOCKS5 代理用户名
- **密码**：你的 SOCKS5 代理密码
- **服务器**：代理服务器地址（IP或域名）
- **端口**：代理服务器端口（通常是 1080）
- **TLS**：是否启用 TLS 加密连接代理服务器
- **SNI**：如启用 TLS，填写代理服务器域名

### 3. 保存配置

点击"更新配置"按钮保存信息。

## 客户端设置

在 Clash、Shadowrocket、V2rayN 等客户端中添加以下配置：

- **服务器**：你的 Worker 域名
- **端口**：443
- **用户名**：你在配置页面设置的用户名
- **密码**：你在配置页面设置的密码
- **协议**：SOCKS5
- **TLS/SSL**：开启

## 使用提示

- 确保你的源代理服务器支持标准 SOCKS5 协议
- 客户端必须启用 TLS/SSL 连接 Worker
- 免费版 Cloudflare Workers 有使用限制，详情参考[官方定价页面](https://developers.cloudflare.com/workers/platform/pricing/)
- 配置页面没有访问控制，注意保护你的 Worker 地址
