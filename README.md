# Integrating cloudinary image upload and displaying images

## Setup

1. create a free account at [cloudinary.com](https://cloudinary.com)
2. Add an `.env.local` file (if not already present for your database)
3. Add the following environment variables with corresponding values from your cloudinary profile:
   1. CLOUDINARY_SECRET=<your_secret>
   2. CLOUDINARY_API_KEY=<your_api_key>
   3. CLOUDINARY_CLOUD_NAME=<cloud_name>

### needed npm packages

`npm i cloudinary formidable`

## API GET route for images

The Cloudinary Media Library already contains some default images, so we can start creating a first API route to retrieve them and test if our setup is working:

- add a new API route file `images.js` and implement a config:

```js
import process from "node:process";
import cloudinary from "cloudinary";

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
```

- add the handler:

```js
export default async function handler(request, response) {
  if (request.method === "GET") {
    try {
      const result = await cloudinary.v2.search
        // see documentation to adjust the query at https://cloudinary.com/documentation/search_api#examples
        .with_field("tags")
        .max_results(10)
        .execute();
      response.status(200).json(result);
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  }
}
```
