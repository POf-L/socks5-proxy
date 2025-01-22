export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);

            if (url.pathname === '/') {
                return Response.redirect(`${url.origin}/config`, 301);
            }

            if (url.pathname === '/config') {
                if (request.method === 'GET') {
                    const proxyConfig = await env.PROXY_CONFIG.get('default', { type: 'json' });
                    const configStr = proxyConfig ? JSON.stringify(proxyConfig, null, 2) : '{}';
                    
                    return new Response(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>代理配置</title>
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
        }
        textarea { 
            width: 100%; 
            height: 300px; 
            margin: 10px 0; 
            font-family: monospace; 
            padding: 10px;
        }
        button { 
            padding: 10px 20px; 
            margin: 5px; 
            cursor: pointer;
        }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>代理配置</h1>
    <div id="message"></div>
    <textarea id="config">${configStr}</textarea>
    <div>
        <button onclick="updateConfig()">更新配置</button>
        <button onclick="deleteConfig()">删除配置</button>
    </div>
    <script>
        async function updateConfig() {
            try {
                const config = JSON.parse(document.getElementById('config').value);
                const response = await fetch('/config', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(config)
                });
                const msg = await response.text();
                showMessage(response.ok ? 'success' : 'error', msg);
            } catch (e) {
                showMessage('error', '无效的 JSON 格式');
            }
        }

        async function deleteConfig() {
            if (!confirm('确定要删除配置吗？')) return;
            const response = await fetch('/config', {
                method: 'DELETE'
            });
            const msg = await response.text();
            showMessage(response.ok ? 'success' : 'error', msg);
            if (response.ok) {
                document.getElementById('config').value = '{}';
            }
        }

        function showMessage(type, text) {
            const div = document.getElementById('message');
            div.className = type;
            div.textContent = text;
            setTimeout(() => div.textContent = '', 3000);
        }
    </script>
</body>
</html>`, {
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8'
                        }
                    });
                }

                if (request.method === 'PUT') {
                    try {
                        const newConfig = await request.json();
                        if (!newConfig.username || !newConfig.password || 
                            !newConfig.server || !newConfig.port) {
                            return new Response('缺少必要的配置字段', { status: 400 });
                        }
                        await env.PROXY_CONFIG.put('default', JSON.stringify(newConfig));
                        return new Response('配置更新成功');
                    } catch (e) {
                        return new Response('无效的 JSON 格式', { status: 400 });
                    }
                }

                if (request.method === 'DELETE') {
                    await env.PROXY_CONFIG.delete('default');
                    return new Response('配置删除成功');
                }
            }

            if (url.pathname === '/socks5') {
                const proxyConfig = await env.PROXY_CONFIG.get('default', { type: 'json' });
                if (!proxyConfig) {
                    return new Response('Proxy configuration not found', { status: 500 });
                }
                return await handleSocks5Request(request, proxyConfig);
            }

            return new Response('Not found', { status: 404 });

        } catch (err) {
            return new Response(err.toString(), { status: 500 });
        }
    },
};

async function handleSocks5Request(request, proxyConfig) {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();

    try {
        const socket = await connectToProxyServer(proxyConfig.server, proxyConfig.port);
        
        server.addEventListener('message', async (event) => {
            try {
                await socket.write(event.data);
            } catch (err) {
                console.error('Error writing to proxy:', err);
                server.close();
            }
        });

        (async () => {
            const reader = socket.readable.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    server.send(value);
                }
            } catch (err) {
                console.error('Error reading from proxy:', err);
            } finally {
                reader.releaseLock();
                server.close();
            }
        })();

        server.addEventListener('close', () => {
            socket.close();
        });

        return new Response(null, { 
            status: 101, 
            webSocket: client 
        });
    } catch (err) {
        server.close();
        return new Response(`Failed to connect to proxy: ${err}`, { status: 500 });
    }
}

async function connectToProxyServer(server, port) {
    return await connect({
        host: server,
        port: port,
    });
}