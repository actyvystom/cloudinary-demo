import process from "node:process";
import cloudinary from "cloudinary";
import formidable from "formidable";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(request, response) {
  if (request.method === "POST") {
    await new Promise((resolve, reject) => {
      const form = formidable({});
      form.parse(request, async (error, fields, files) => {
        if (error) {
          reject();
        } else {
          const { file } = files;
          const { newFilename, filepath } = file;
          const result = await cloudinary.v2.uploader.upload(filepath, {
            public_id: newFilename
          });
          console.log("API response from cloudinary: ", result);
          response.status(201).json(result);
          resolve();
        }
      });
    });
  }
}
