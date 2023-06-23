import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";
import Gallery from "../components/Gallery";
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
        <Gallery />
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
