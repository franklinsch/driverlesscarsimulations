// Importing node modules
const express = require('express');
// Importing source files
const routes = require('./routes/routes');
// consts
const app = express();

app.use('/', routes);

// arrow functions
const server = app.listen(3000, () => {
	// destructuring
  const {address, port} = server.address();

  // string interpolation:
  console.log(`Example app listening at http://${address}:${port}`);
});
