var http = require('http');

http.creatServer(function (req, res) {
  res.write("I'm alive");
  res.end();
}).listen(8080);
