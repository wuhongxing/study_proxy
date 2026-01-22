const http = require('http');
const url = require('url');
const net = require('net');

// 实现 HTTPS 的代理服务器，由于这个是基于 TCP 的，所以 HTTP 也是可用的
http
.createServer()
.on('connect', (req, socket) => {
    const u = url.parse('http://' + req.url);
    /**
     * http.request 是 HTTP 协议层 的工具，会帮你组装请求头、解析响应、处理状态码。
     * net.connect 是 TCP 层 的原始 socket，适合做“字节转发”，也就是把客户端和目标服务器的字节流直接 pipe 过去。
     */
    const proxySocket = net.connect(u.port || 443, u.hostname, () => {
        // 告诉客户端连接成功
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        console.log('2. 告诉客户端连接成功');
        proxySocket.on('data', (chunk) => {
            console.log('proxySocket data:------', chunk.length, chunk.toString());
        });
        proxySocket.on('end', () => {
            console.log('proxySocket end');
        });
        proxySocket.pipe(socket);
    }).on("error", (err) => {
        socket.end();
    });
    socket.on('data', (chunk) => {
        console.log('client data:------', chunk.length, chunk.toString());
    });
    socket.on('end', () => {
        console.log('client end');
    });
    socket.pipe(proxySocket);
})
.listen(8000, () => {
    console.log('Server is running on port 8000');
});