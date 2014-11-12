/**
 * @file 测试服务器
 * @author treelite(c.xinle@gmail.com)
 */

var MIME_TYPES = {
    json: 'application/json',
    js: 'text/javascript',
    html: 'text/html'
};

var IS_SILENT = false;

function log(msg) {
    if (!IS_SILENT) {
        console.log('[Server]' + msg);
    }
}

/**
 * 判断是否是静态文件
 *
 * @inner
 * @param {string} pathname
 * @return {boolean}
 */
function isStatic(pathname) {
    if (pathname.charAt(0) === '/') {
        pathname = pathname.substring(1);
    }
    var path = require('path');
    var fs = require('fs');
    var file = path.resolve(process.cwd(), pathname);

    return fs.existsSync(file);
}

/**
 * 获取静态文件
 *
 * @inner
 * @param {string} pathname
 * @return {Object}
 */
function getStatic(pathname) {
    if (pathname.charAt(0) === '/') {
        pathname = pathname.substring(1);
    }
    var path = require('path');
    var fs = require('fs');
    var file = path.resolve(process.cwd(), pathname);

    return {
        content: fs.readFileSync(file),
        mimetype: MIME_TYPES[path.extname(file).substring(1)] || 'text/html'
    };
}


var http = require('http');

var port = process.argv[2] || 8848;

IS_SILENT = process.argv[3] === 'true';

var server = http.createServer();

var urlMgr = require('url');
server.on('request', function (request, response) {
    var url = urlMgr.parse(request.url);
    var pathname = url.pathname;
    log('[Request]' + pathname);
    if (isStatic(pathname)) {
        var data = getStatic(pathname);

        response.statusCode = 200;
        response.setHeader('Content-Type', data.mimetype);
        response.end(data.content);
    }
    else {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html');
        response.end('not found');
    }
});

server.listen(port);
log('server start at ' + port + '...');
