const { IncomingForm } = require('formidable');
const fs = require('fs');
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = new IncomingForm({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });

    const file = files.file;
    const fileData = fs.readFileSync(file.filepath);
    const content = Buffer.from(fileData).toString('base64');
    const fileName = Date.now() + '-' + file.originalFilename.replace(/\s+/g, '-');

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // simpan di Vercel env
    const USERNAME = 'SeptianXcz';
    const REPO = 'image-uploader';
    const FILE_PATH = `public/${fileName}`;

    try {
      const response = await axios.put(
        `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FILE_PATH}`,
        {
          message: `upload ${fileName}`,
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
        url: `https://${REPO}.vercel.app/${fileName}`
      });
    } catch (err) {
      return res.status(500).json({ error: err.response?.data || err.message });
    }
  });
};
