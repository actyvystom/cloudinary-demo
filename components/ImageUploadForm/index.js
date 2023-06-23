import React, { useState } from "react";
import styled from "styled-components";
import { useSWRConfig } from "swr";
function ImageUploadForm() {
  const { mutate } = useSWRConfig();
  const [uploadStatus, setUploadStatus] = useState("");
  async function submitImage(event) {
    event.preventDefault();
    setUploadStatus("Uploading...");
    const formData = new FormData(event.target);

    try {
      const response = await fetch("/api/upload", {
        method: "post",
        body: formData
      });
      const img = await response.json();
      setUploadStatus("Uploaded!");
      mutate("/api/images");
    } catch (error) {
      setError(error);
    }
  }

  return (
    <Form onSubmit={submitImage}>
      <input type="file" name="file" />
      <button type="submit">Upload</button>
      <p>{uploadStatus}</p>
    </Form>
  );
}
const Form = styled.form`
  margin: 2rem auto;
`;
export default ImageUploadForm;
