# HTTP 代理原理及实现
本文实现了代理服务器，以及客户端如何使用代理服务器进行网络请求。

HTTP 代理有两种形式，一种是普通代理，仅对请求进行转发。第二种是隧道代理，通过 CONNECT 建立一个 TCP 连接，对字节流进行盲转发。

## 普通代理
![普通代理](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f975dcf4258847fc953be37343b14a36~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)
就是一个中间人的角色，负责转发两边的数据流。对于客户端来说，它是服务端。对于服务端来说，它是客户端。

由于这个传输是明文的，所以代理能够拿到请求过程中的所有信息。

实现也非常简单，详见 proxy-basic.js。

有一个点需要注意一下:
1. pipe 只会转发 body 的可读流，所以在要自己拼上 header

## 隧道代理
![隧道代理](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c514cc172f6c41e08f94e0a977dbf525~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

大致的实现逻辑如下：

1. 客户端先对代理发起 CONNECT，请求建立到目标站点的隧道
2. 代理服务器解析参数后，使用 net.connect 连接目标站点
3. 目标站点连接成功后，告诉客户端，此时隧道建立成功
4. 在该 socket 上进行 TLS 握手
5. TLS 握手完成后，开始真正的发送内容

这里有几个需要注意的点：

1. http.request 是 HTTP 协议层 的工具，会帮你组装请求头、解析响应、处理状态码。
2. net.connect 是 TCP 层 的原始 socket，适合做“字节转发”，也就是把客户端和目标服务器的字节流直接 pipe 过去。
3. 这个连接成功，是需要代理服务器主动发送的。肯定要先连接成功之后才能开始转发。
4. 然后其实就可以开始转发了，只不过如果需要加密的话，就需要经过一个 TLS 握手，但这个并不是必须的。详情 http-connect-tunnel.js 和 https-connect-tunnel.js。

## 参考
https://juejin.cn/post/6998351770871152653
