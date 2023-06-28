import process from "node:process";

import cloudinary from "cloudinary";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({});
  form.parse(req, async (error, fields, files) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    const { file } = files;
    const { newFilename, filepath } = file[0];
    const result = await cloudinary.v2.uploader.upload(filepath, {
      public_id: newFilename
    });
    console.log("API: response from cloudinary: ", result);
    return res.status(201).json(result);
  });
}
