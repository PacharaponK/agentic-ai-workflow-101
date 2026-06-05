const http = require("http");
const url = require("url");
const fs = require("fs");

const turboMode = process.argv.includes("--turbo");

if (turboMode) {
  console.log("TURBO MODE is running now");
}

var f = "";

http
  .createServer((req, res) => {
    const q = url.parse(req.url, true).query;
    f = q.file;

    if (!f) {
      res.end("Missing required parameter. Example: ?file=demo/test.txt");
      return;
    }

    fs.readFile(f, (err, data) => {
      res.end(data);
    });
  })
  .listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
  });
