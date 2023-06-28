import useSWR from "swr";
import React, { useState } from "react";
import styled from "styled-components";

export default function ImageUploadForm() {
  const { mutate } = useSWR("/api/images");
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState(undefined);
  async function submitImage(event) {
    event.preventDefault();
    setUploadStatus("Uploading");
    const formData = new FormData(event.target);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (response.status === 201) {
        mutate();
        setUploadStatus("Upload complete");
      }
    } catch (error) {
      setError(error);
    }
  }

  return (
    <>
      <h2>Image Upload</h2>
      <form onSubmit={submitImage}>
        <input type="file" name="file" />
        <button>Upload</button>
        <p>{uploadStatus}</p>
        {error && <p>{error.message}</p>}
      </form>
    </>
  );
}
