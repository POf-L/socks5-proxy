## 快速开始
1.  **克隆项目:**
    ```bash
    git clone https://github.com/w10lhx/socks5-proxy.git
    cd socks5-proxy
    ```
2.  **安装依赖:**
    ```bash
    npm install
    ```
3.  **创建 KV 命名空间:**
    此 KV 命名空间将用于存储您的 SOCKS5 代理配置。
    ```bash
    # 将 "PROXY_CONFIG" 替换为您想要的名称 (可选)
    wrangler kv:namespace create "PROXY_CONFIG"
    ```
    执行命令后，会输出 KV 命名空间的 ID，请记下它。
4.  **配置 `wrangler.toml`:**
    打开项目根目录下的 `wrangler.toml` 文件，找到 `kv_namespaces` 部分，将上一步获取到的 `id` 填入：
    ```toml
    # ... 其他配置 ...
    kv_namespaces = [
      { binding = "PROXY_CONFIG", id = "这里替换为你的 KV 命名空间 ID" }
    ]
    # ... 其他配置 ...
    ```
    *注意：* 您可能还需要根据需要修改 `name` 和 `account_id` 等其他配置项。`account_id` 可以登录 Cloudflare Dashboard 后在右侧获取。
5.  **部署到 Cloudflare Workers:**
    ```bash
    wrangler deploy
    ```
    部署成功后，Wrangler CLI 会输出您的 Worker 访问地址（例如 `https://your-worker-name.your-subdomain.workers.dev`）。
## 配置说明
部署完成后，您需要配置要中转的 SOCKS5 代理服务器信息。
1.  **访问配置页面:**
    在浏览器中打开 `https://<你的 Worker 域名>/config`。例如：`https://your-worker-name.your-subdomain.workers.dev/config`
2.  **填写代理信息:**
    在页面表单中输入您的 SOCKS5 代理服务器的详细信息：
    *   **Username:** SOCKS5 代理的用户名
    *   **Password:** SOCKS5 代理的密码
    *   **Server:** SOCKS5 代理服务器的主机名或 IP 地址
    *   **Port:** SOCKS5 代理服务器的端口号 (通常是 1080)
    *   **TLS:** 是否需要 Worker 与您的 SOCKS5 代理服务器之间启用 TLS 加密 (需要目标代理服务器支持)
    *   **SNI:** 如果启用了 TLS，指定服务器名称指示 (Server Name Indication)，通常是代理服务器的域名。
3.  **保存配置:** 点击 "Save Configuration" 按钮。配置信息将被安全地存储在之前创建的 Cloudflare KV 中。
## 客户端设置
在您的 SOCKS5 客户端（如 Clash, Shadowrocket, V2RayN 等）中进行如下设置：
*   **服务器地址 (Address/Server):** 您的 Worker 域名 (例如 `your-worker-name.your-subdomain.workers.dev`)
*   **端口 (Port):** `443` (因为 Worker 默认通过 HTTPS 访问)
*   **用户名 (Username):** 您在 `/config` 页面设置的用户名
*   **密码 (Password):** 您在 `/config` 页面设置的密码
*   **协议 (Protocol/Type):** SOCKS5
*   **TLS/SSL (如果可用):** 启用 (连接到 Worker 使用的是 HTTPS)
## 注意事项
*   请确保您配置的目标代理服务器本身支持标准的 SOCKS5 协议。
*   强烈建议在客户端设置中启用 TLS/SSL (连接到 Worker 地址时)，以保障通信安全。
*   Cloudflare Workers 有免费套餐的使用限制 (如每日请求数、CPU 时间等)，超出限制可能会产生费用或服务中断。请查阅 [Cloudflare Workers 定价页面](https://developers.cloudflare.com/workers/platform/pricing/) 获取详细信息。
*   配置页面 `/config` 没有任何访问控制，请确保您的 Worker 地址不被随意泄露，或考虑自行添加访问验证。
