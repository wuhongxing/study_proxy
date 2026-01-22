const http = require('http');
const url = require('url');

// 实现 HTTP 的代理服务器
http
.createServer()
.on('request', (req, res) => {
    const u = url.parse(req.url)
    const options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: req.method,
        headers: req.headers,
    }
    const proxyReq = http.request(options, (proxyRes) => {
        // 将目标服务器的状态码和响应头转发给客户端
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        // 打印响应体内容，再转发给客户端
        proxyRes.on('data', (chunk) => {
            console.log('proxyRes data:', chunk.toString());
        });
        proxyRes.on('end', () => {
            console.log('proxyRes end');
        });
        // 将目标服务器响应体流式转发给客户端
        proxyRes.pipe(res);
    })
    .on('error', (err) => {
        res.end();
    });
    // 将客户端请求体流式转发给目标服务器
    req.pipe(proxyReq);
})
.listen(9000, () => {
    console.log('Server is running on port 9000');
});