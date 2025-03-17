const http = require('http');   
const path = require('path');

const app = require('./app'); 

// 2) (Optional) If you want to serve static files from /public:
//app.use(require('express').static(path.join(__dirname, 'public')));

// 3) Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

