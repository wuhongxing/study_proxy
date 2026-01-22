const http = require('http');
const tls = require('tls');

// HTTPS 走代理时，先用 CONNECT 建立隧道，再在隧道内进行 TLS 握手
const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: 'news.baidu.com:443', // 目标站点的域名和端口
    method: 'CONNECT',
};

// 1. 先对代理发起 CONNECT，请求建立到目标站点的隧道
const req = http.request(options);
console.log('1. 先对代理发起 CONNECT，请求建立到目标站点的隧道');
req.on('connect', (res, socket) => {
    if (res.statusCode !== 200) {
        console.error('CONNECT failed:', res.statusCode);
        socket.destroy();
        return;
    }

    // 隧道建立成功后，在该 socket 上进行 TLS 握手
    console.log('3. 隧道建立成功后，在该 socket 上进行 TLS 握手');
    // 如果这里不是 HTTPS 的话，就不需要经过 tls 握手了
    // 可以直接使用 socket.write 发送请求内容，详情 http-connect-tunnel.js 文件
    const tlsSocket = tls.connect({
        socket,
        servername: 'news.baidu.com',
    }, () => {
        // TLS 握手完成后，发送真正的 HTTPS 请求内容
        console.log('4. TLS 握手完成后，发送真正的 HTTPS 请求内容');
        const sendRequest = (id) => {
            tlsSocket.write(
                `GET /?id=${id} HTTP/1.1\r\n` +
                'Host: news.baidu.com\r\n' +
                // Keep-Alive 是 HTTP/1.1 的规范，用于保持 TCP 连接
                // 这里面保持连接是为了复用同一个 TCP 连接，避免每次请求都重新建立 TCP 连接
                // Close 是 HTTP/1.0 的规范，用于关闭 TCP 连接
                // 这里如果改成 Close 下面的请求执行一次之后就会结束
                'Connection: Keep-Alive\r\n' +
                // 服务端侧 keep-alive 配置：5 秒空闲后关闭连接，最多复用 10 次
                'Keep-Alive: timeout=5, max=10\r\n' +
                '\r\n'
            );
        };

        // 同一个 TLS 连接上复用多次请求
        sendRequest(1);
        setTimeout(() => sendRequest(2), 1000);
        setTimeout(() => sendRequest(3), 2000);
    });

    // 客户端侧强制 5 秒空闲后关闭连接（不依赖服务端是否遵守 keep-alive）
    // tlsSocket.setTimeout(5000, () => {
    //     tlsSocket.end();
    //     tlsSocket.destroy();
    // });

    tlsSocket.on('data', (chunk) => {
        // console.log('tls data:', chunk.toString());
    });

    tlsSocket.on('end', () => {
        console.log('tls end');
    });

    tlsSocket.on('error', (err) => {
        console.error('tls error:', err.message);
    });
});

req.on('error', (err) => {
    console.error('request error:', err.message);
});

req.end();
