const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const busboy = require('busboy');
  const bb = busboy({ headers: req.headers });

  let fileName = '';
  const uploadDir = path.join(__dirname, '../public');

  bb.on('file', (fieldname, file, info) => {
    fileName = Date.now() + '-' + info.filename.replace(/\s+/g, '-');
    const saveTo = path.join(uploadDir, fileName);
    file.pipe(fs.createWriteStream(saveTo));
  });

  bb.on('close', () => {
    return res.status(200).json({
      success: true,
      url: `/${fileName}`
    });
  });

  req.pipe(bb);
};
