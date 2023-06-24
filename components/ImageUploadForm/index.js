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
    <>
      <h2>Image Upload</h2>
      <Form onSubmit={submitImage}>
        <input type="file" name="file" />
        <StyledButton type="submit">Upload</StyledButton>
        <p>{uploadStatus}</p>
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
