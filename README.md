# Integrating cloudinary image upload and displaying images

## Setup

1. create a free account at [cloudinary.com](https://cloudinary.com)
2. Add an `.env.local` file (if not already present for your database)
3. Add the following environment variables with corresponding values from your cloudinary profile:
   1. CLOUDINARY_SECRET=<your_secret>
   2. CLOUDINARY_API_KEY=<your_api_key>
   3. CLOUDINARY_CLOUD_NAME=<cloud_name>
4. Add the following entry to your `next.config.js`:

```js
...
images: {
    domains: ["res.cloudinary.com"],
  },
...
```

### Needed npm packages

`npm i cloudinary formidable@2.0.1 swr`

## API GET route for images

The Cloudinary Media Library already contains some default images, so we can start creating a first API route to retrieve them and test if our setup is working:

- add a new API route `images/index.js` and implement the cloudinary config:

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

- test the api route by calling it in the browser: http://localhost:3000/api/images

## Using this route in an ImageList component

- Create a new component in `components/ImageList/index.js`

- Some sample code:

```js
import useSWR from "swr";
import Image from "next/image";
import styled from "styled-components";
import Link from "next/link";
export default function ImageList() {
  const { data, error } = useSWR("/api/images");
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
    <StyledList>
      {data.resources.map((image) => (
        <StyledListItem key={image.asset_id}>
          <Link href={`/images/${image.public_id}`} key={image.asset_id}>
            <a>
              <StyledImage
                key={image.public_id}
                src={image.url}
                layout="responsive"
                height={image.height}
                width={image.width}
                style={{ borderRadius: "0.5rem", borderColor: "black" }}
                alt={`Image-Id: ${image.public_id}`}
              />
            </a>
          </Link>
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

export default async function handler(request, response) {
  switch (request.method) {
    case "POST":
      await new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(request, async (error, fields, files) => {
          if (error) {
            reject(error);
          } else {
            const { file } = files;

            const { newFilename, filepath } = file;
            const result = await cloudinary.v2.uploader.upload(filepath, {
              public_id: newFilename
            });
            console.log("API: response from cloudinary: ", result);
            response.status(201).json(result);
            resolve();
          }
        });
      });
      break;
    default:
      response.status(400).json({ message: "Method not implemented" });
      break;
  }
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
import useSWR from "swr";
function ImageUploadForm() {
  const { mutate } = useSWR("/api/images/");
  const [uploadStatus, setUploadStatus] = useState(false);
  const [error, setError] = useState(undefined);
  async function submitImage(event) {
    event.preventDefault();
    setUploadStatus("Uploading...");
    const formData = new FormData(event.target);

    try {
      const response = await fetch("/api/upload", {
        method: "post",
        body: formData
      });
      if (response.status === 201) {
        mutate();
        setUploadStatus("Upload complete!");
      }
    } catch (error) {
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

## Tie all together in your HomePage component

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
        <ImageList />
        <StyledUpload>
          <ImageUploadForm />
        </StyledUpload>
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
