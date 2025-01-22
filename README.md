# SOCKS5 代理中转服务

基于 Cloudflare Workers 实现的 SOCKS5 代理中转服务，通过 Cloudflare 的全球网络提供稳定、快速的代理中转功能。

## 功能特点

- 基于 Cloudflare Workers 部署，无需服务器
- 使用 KV 存储管理代理配置
- 提供 Web 界面进行配置管理
- 支持 TLS 加密连接
- 支持用户名密码认证

## 部署说明

1. 克隆代码：
$ bash
git clone https://github.com/w10lhx/socks5-proxy.git
cd socks5-proxy
2. 安装依赖：
$ bash
npm install
3.创建 KV 命名空间：
$ bash
wrangler kv:namespace create "PROXY_CONFIG"
4.修改 wrangler.toml 配置文件，填入 KV 命名空间 ID。
5.部署到 Cloudflare Workers：
$ bash
wrangler deploy

## 使用方法
1. 访问配置页面： https://你的域名/config
2. 填写代理服务器配置信息：
 {} json
{
    "username": "用户名",
    "password": "密码",
    "server": "代理服务器地址",
    "port": 1080,
    "tls": true,
    "sni": "代理服务器域名"
}
3.在代理客户端中配置：
- 服务器：你的 Workers 域名
- 端口：443
- 用户名和密码：与配置中相同

## 注意事项
- 确保代理服务器支持 SOCKS5 协议
- 建议启用 TLS 加密以提高安全性
- Workers 可能受到 Cloudflare 的使用限制
