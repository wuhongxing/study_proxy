const http = require('http');

// 一个最小化的 HTTP 代理 Agent：把目标请求改为走代理
class SimpleHttpProxyAgent extends http.Agent {
    constructor(proxy) {
        super();
        this.proxy = proxy;
    }

    addRequest(req, options) {
        const targetHost = options.hostname || options.host;
        const targetPort = options.port || 80;
        const targetPath = options.path || '/';
        const targetUrl = `http://${targetHost}:${targetPort}${targetPath}`;

        options.hostname = this.proxy.host;
        options.host = this.proxy.host;
        options.port = this.proxy.port;
        options.path = targetUrl;
        options.headers = {
            ...options.headers,
            Host: targetHost,
            Connection: 'Close',
        };

        return super.addRequest(req, options);
    }
}

const agent = new SimpleHttpProxyAgent({ host: '127.0.0.1', port: 9000 });

const req = http.request(
    {
        hostname: 'www.baidu.com',
        port: 80,
        path: '/',
        method: 'GET',
        agent,
    },
    (res) => {
        res.on('data', (chunk) => {
            console.log('res data:', chunk.toString());
        });

        res.on('end', () => {
            console.log('res end');
        });
    }
);

req.on('error', (err) => {
    console.error('request error:', err.message);
});

req.end();

