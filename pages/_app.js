import GlobalStyle from "../components/GlobalStyle";
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

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher }}>
      <GlobalStyle />
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
