const http = require('http');

// HTTP 基础代理示例：通过代理直接请求目标 URL
const options = {
    hostname: '127.0.0.1',
    port: 9000,
    method: 'GET',
    path: 'https://www.baidu.com:80',
    headers: {
        Host: 'www.baidu.com',
        Connection: 'Close',
    },
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
        console.log('res data:', chunk.toString());
    });

    res.on('end', () => {
        console.log('res end');
    });
});

req.on('error', (err) => {
    console.error('request error:', err.message);
});

req.end();
