const { IncomingForm } = require('formidable');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = new IncomingForm({ maxFileSize: 25 * 1024 * 1024, keepExtensions: true }); // 25 MB max
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File error: ' + err.message });

    const file = files.file;
    const fileData = fs.readFileSync(file.filepath);
    const content = Buffer.from(fileData).toString('base64');

    const fileName = Date.now() + '-' + file.originalFilename.replace(/\s+/g, '-');
    const uploadPath = `public/uploads/${fileName}`;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const USERNAME = 'Carlotta-gf';
    const REPO = 'baymaxcloud';

    try {
      await axios.put(
        `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${uploadPath}`,
        {
          message: `upload file ${fileName}`,
          content: content
        },
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            'User-Agent': USERNAME
          }
        }
      );

      return res.json({
        success: true,
        url: `https://${REPO}.vercel.app/uploads/${fileName}`
      });
    } catch (error) {
      return res.status(500).json({ error: error.response?.data || error.message });
    }
  });
};