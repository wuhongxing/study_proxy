const http = require('http');

// HTTP 使用 proxy-tunnel 进行代理
const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: 'imququ.com:80',
    method: 'CONNECT',
}

const req = http.request(options)
req.on('connect', (res, socket) => {
    socket.write('GET / HTTP/1.1\r\n' +
        'Host: imququ.com\r\n' +
        'Connection: Close\r\n' +
        '\r\n');

    socket.on('data', function(chunk) {
        console.log('socket data:', chunk.toString());
    });

    socket.on('end', function() {
        console.log('socket end');
    });
})
req.end();