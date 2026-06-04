const http = require("http");
const url = require("url");
const fs = require("fs");

const turboMode = process.argv.includes("--turbo");

const sixty_seven = [
  { lang: "English", word: "sixty-seven" },
  { lang: "Thai", word: "หกสิบเจ็ด" },
  { lang: "Japanese", word: "六十七 (rokujū-nana)" },
  { lang: "Chinese", word: "六十七 (liùshíqī)" },
  { lang: "Korean", word: "육십칠 (yukshipchil)" },
  { lang: "Spanish", word: "sesenta y siete" },
  { lang: "French", word: "soixante-sept" },
  { lang: "German", word: "siebenundsechzig" },
  { lang: "Italian", word: "sessantasette" },
  { lang: "Portuguese", word: "sessenta e sete" },
  { lang: "Russian", word: "шестьдесят семь" },
  { lang: "Arabic", word: "سبعة وستون" },
];

if (turboMode) {
  let i = 0;
  setInterval(() => {
    const entry = sixty_seven[i % sixty_seven.length];
    console.log(`[TURBO] 67 in ${entry.lang}: ${entry.word}`);
    i++;
  }, 1000);
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
