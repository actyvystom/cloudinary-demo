<small>This demo uses Next.js version (13.2.3) and latest formidable (3.4.0)</small>

# Integrating cloudinary image upload and displaying images

## Setup

1. create a free account at [cloudinary.com](https://cloudinary.com)
2. Add an `.env.local` file (if not already present for your database connection string)
3. Add the following environment variables with corresponding values from your cloudinary profile (see Product Environment Credentials on your dashboard at [cloudinary console](https://console.cloudinary.com/console) to get the values):
   1. CLOUDINARY_SECRET=<your_secret>
   2. CLOUDINARY_API_KEY=<your_api_key>
   3. CLOUDINARY_CLOUD_NAME=<cloud_name>
4. Add the following entry to your `next.config.js` to allow Next.js to display images from cloudinary:

```js
...
images: {
    domains: ["res.cloudinary.com"],
  },
...
```

### Needed npm packages

- Install the following npm packages (formidable version number is important!):

`npm i cloudinary formidable@2.0.1 swr`

## API GET route for images

The Cloudinary Media Library already contains some default images, so we can start creating a first API route to retrieve them and test if our setup is working:

- add a new API route `api/images/index.js` and implement the route:

```js
// needed to read the .env variables
import process from "node:process";
import cloudinary from "cloudinary";

// as the default setting of Next.js API is using the bodyParser, we need to deactivate it by setting its config
export const config = {
  api: {
    bodyParser: false
  }
};
// set the cloudinary config to use your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});
```

- add the handler for the api route:

```js
export default async function handler(request, response) {
  if (request.method === "GET") {
    try {
      // we use cloudinary search API to retrieve images
      const result = await cloudinary.v2.search
        // see documentation to adjust the query at https://cloudinary.com/documentation/search_api#examples
        .with_field("tags")
        .max_results(10)
        .execute();
      // finally we deliver the response with the result as JSON
      response.status(200).json(result);
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  }
}
```

- test the api route by calling it in the browser: http://localhost:3000/api/images

## Using this route in an ImageList component

- Create a new component in `components/ImageList/index.js`

- Create your component basically like this:

```js
import useSWR from "swr";
// we want to use the next Image component to display our cloudinary images
import Image from "next/image";
import styled from "styled-components";
// When setting up a detail page use the Next Link component to add the Linking
import Link from "next/link";
export default function ImageList() {
  // get image data (and error for error handling) via useSWR hook from the next api route
  const { data, error } = useSWR("/api/images");
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
    <StyledList>
      {/* map over our data.resources to get render every image returned*/}
      {data.resources.map((image) => (
        <StyledListItem key={image.asset_id}>
          <Link href={`/images/${image.public_id}`} key={image.asset_id}>
            {/* wrapping our Next StyledImage in an <a>-Tag is necessary to avoid some next errors 🤷‍♂️*/}
            <a>
              <StyledImage
                key={image.public_id}
                src={image.url}
                layout="responsive"
                height={image.height}
                width={image.width}
                alt={`Image-Id: ${image.public_id}`}
              />
            </a>
          </Link>
          {/*Check for available Tags to display by mapping through the tags array of image, otherwise show nothing or untagged*/}
          <p>
            {image.tags.length > 0 ? (
              image.tags.map((tag, index) => (
                <StyledTag key={`tag-${index}`}>{tag}</StyledTag>
              ))
            ) : (
              <i>untagged</i>
            )}
          </p>
        </StyledListItem>
      ))}
    </StyledList>
  );
}

export const StyledTag = styled.span`
  background-color: #ddd;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
`;
const StyledList = styled.ul`
  list-style: none;
  padding: 0;
`;
const StyledListItem = styled.li`
  margin-bottom: 2rem;
  border-bottom: 1px solid #ccc;
`;
const StyledImage = styled(Image)`
  border-radius: 0.5rem;
  border-color: aliceblue;
`;
```

## Setting up an upload API route

```js
import process from "node:process";

import cloudinary from "cloudinary";
import formidable from "formidable";
// formidable does not work with the default api settings o Next.js, so we disable the bodyParser via config
export const config = {
  api: {
    bodyParser: false
  }
};
// set the cloudinary config to use your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});
// define our async handler function - simplified :)
export default async function handler(req, res) {
  // we check for POST, all methods return 405
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({});
  // using formidables' parse method to get a simple access to the file data
  form.parse(req, async (error, fields, files) => {
    // return an error status if parsing fails
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    // deconstruct our file from files data, will return an array with one element
    const { file } = files;
    // deconstruct the needed values from our file object at index 0
    const { newFilename, filepath } = file[0];
    // call our cloudinary uploader with the required arguments
    const result = await cloudinary.v2.uploader.upload(filepath, {
      public_id: newFilename
    });
    console.log("API: response from cloudinary: ", result);
    // return our just uploaded image result from cloudinary upload
    return res.status(201).json(result);
  });
}
```

- as we are using SWR, we configure our `fetcher` globally in `_app.js`:

```js
import { SWRConfig } from "swr";

// const fetcher = (...args) => fetch(...args).then((res) => res.json());
async function fetcher(...args) {
  try {
    const response = await fetch(...args);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

- wrap it around our components:

```js
...
<SWRConfig value={{ fetcher }}>
    <GlobalStyle />
    <Component {...pageProps} />
</SWRConfig>
...
```

## Setting up an image upload form component

- Create a new component `components/ImageUploadForm/index.js`

```js
import React, { useState } from "react";
import styled from "styled-components";
// we are using useSWR to mutate the data once a file has been uploaded
import useSWR from "swr";
function ImageUploadForm() {
  const { mutate } = useSWR("/api/images/");
  // We define some states to give some feedback to the user what happened to our upload
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState(undefined);
  // a kind of 'standard' form handler
  async function submitImage(event) {
    event.preventDefault();
    setUploadStatus("Uploading...");
    const formData = new FormData(event.target);
    // we use fetch to call our API and pass the form data and request method
    try {
      const response = await fetch("/api/upload", {
        method: "post",
        body: formData
      });
      // once the file is uploaded (= the promise in our api upload is resolved)
      if (response.status === 201) {
        // we call mutate to refresh our image data
        mutate();
        // and set a successful state
        setUploadStatus("Upload complete!");
      }
    } catch (error) {
      // in case of error, we set the state accordingly
      setError(error);
    }
  }

  return (
    <>
      <h2>Image Upload</h2>
      <Form onSubmit={submitImage}>
        <input type="file" name="file" />
        <StyledButton type="submit">Upload</StyledButton>
        <p>{uploadStatus}</p>
        {/*we use conditional rendering */}
        {error && <p>{error.message}</p>}
      </Form>
    </>
  );
}
const Form = styled.form`
  margin: 2rem auto;
`;
const StyledButton = styled.button`
  background-color: green;
  margin-top: 0.5rem;
  border-radius: 0.5rem;
  padding: 0.25rem 1rem;
  color: white;
`;
export default ImageUploadForm;
```

## Put it all together in your HomePage component

```js
import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";
import ImageList from "../components/ImageList";
import ImageUploadForm from "../components/ImageUploadForm";
export default function Home() {
  return (
    <div>
      <Head>
        <title>Cloudinary Demo</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <h1>Cloudinary Demo</h1>
        <StyledUpload>
          <ImageUploadForm />
        </StyledUpload>
        <ImageList />
      </Main>
    </div>
  );
}

const Main = styled.main`
  text-align: center;
`;
const StyledUpload = styled.div`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 4rem;
`;
```

---

## Links & Resources

- [Node.js Backend SDK used in this Demo](https://cloudinary.com/documentation/node_integration)
- [Search API Examples](https://cloudinary.com/documentation/search_api#examples)
- :exclamation: We did not use this directly, but for reference [Upload API Docs](https://cloudinary.com/documentation/image_upload_api_reference)
- [All backend SDKs](https://cloudinary.com/documentation/backend_sdks)
- [Frontend SDKs](https://cloudinary.com/documentation/frontend_sdks)
- [Next.js SDK](https://next-cloudinary.spacejelly.dev/)
