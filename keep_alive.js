const http = require('http');

function keepAlive() {
  // Send a request to the server to keep the session alive
  fetch('/keep-alive-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  .then(response => {
    // Handle the response if needed
    console.log('Keep-alive request sent successfully');
  })
  .catch(error => {
    console.error('Error sending keep-alive request:', error);
  });
}

// Set up an interval to send the keep-alive request every, for example, 5 minutes
setInterval(keepAlive, 5 * 60 * 1000);

// Create a simple HTTP server to keep the script running
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Keep-alive server is running.');
}).listen(3000); // Adjust the port as needed
