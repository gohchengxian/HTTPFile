const fs = require('fs')
const path = require('path')
const express = require("express");
const app = express();
const request = require("request");

if (!fs.existsSync(`./Share_File`)) {
  fs.mkdirSync(`./Share_File`);
};

app.use(async (req, res) => {
  var originalUrl = req.originalUrl;
  if (originalUrl.startsWith('/file')) {
    try {
      var owo = fs.readdirSync(__dirname + "/Share_File" + req.originalUrl.replace('/file', '')) || fs.readdirSync(__dirname + "/Share_File" + req.originalUrl.replace('/file', '') + "/");
      /*owo.forEach(xd => {
        fs.stat(__dirname + "/Share_File" + req.originalUrl.replace('/file', '') + xd, (err, stat) => {
          if(err) return console.log(err);
          console.log(stat)
        });
      })*/
      var gethtml = getHtml(owo, req.originalUrl)
      res.status(200).send(gethtml);
    } catch (e) {
      try {
        var file = path.resolve(__dirname + "/Share_File" + decodeURIComponent(originalUrl.replace('/file', '')));
        res.status(200).sendFile(file)
      } catch (e) {
        res.status(404).send('File not found')
      };
    };
  } else if (originalUrl.startsWith('/download')) {
    var file = path.resolve(__dirname + "/Share_File" + decodeURIComponent(originalUrl.replace('/download', '')))
    res.download(file);
  } else if (originalUrl.startsWith('/upload')) {
    var query = req.query;
    console.log(query.path)
    if (query.url && query.path && query.filename) {
      if (!fs.existsSync(`./Share_File${query.path}`)) {
        fs.mkdirSync(`./Share_File${query.path}`);
      };
      await request.head(query.url, async function(err, response, body) {
        if (err) return err;
        var filename = query.filename;
        console.log(`Start Download: ${query.url}`)
        console.log('content-type:', response.headers['content-type']);
        console.log('content-length:', response.headers['content-length']);
        await request(query.url).on('error', function(err) { console.log(err) }).pipe(fs.createWriteStream(`./Share_File${query.path}` + filename)).on('close', function() {
          console.log(`Finish Download`);
          res.redirect(`/file${query.path}${filename}`)
        });
      });
    } else {
      res.status(404).send({ status: 404, message: "Sample: /upload?url=https://cdn-image.nic20.tk/img/yaoi/OdFWZHu.png&path=/&filename=yaoi.png" })
    }
  } else {
    res.redirect('/file' + originalUrl)
  }
});

app.listen(process.env.PORT);

function getHtml(list, url) {
  var data = [];
  list.forEach(xd => {
    data.push(`<a href="${url}/${xd}" >${xd}</a>`)
  });
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html" charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Directory of ${url.replace("/file", '')} </title>
</head>
<body>
<h2>Directory of ${url.replace("/file", '')}</h2>
${data.join('<br/>\n')}
</body>
</html>`

}
