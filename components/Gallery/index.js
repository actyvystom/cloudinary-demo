import useSWR from "swr";
import Image from "next/image";
import styled from "styled-components";
export default function Gallery() {
  const { data, error } = useSWR("/api/images");
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
    <div>
      {data.resources.map((image) => (
        <>
          <Image
            key={image.public_id}
            src={image.url}
            layout="responsive"
            height={image.height}
            width={image.width}
            alt={`Image-Id: ${image.public_id}`}
          />
          <p>
            {image.tags.length > 0 ? (
              image.tags.map((tag, index) => (
                <StyledTag key={`tag-${index}`}>{tag}</StyledTag>
              ))
            ) : (
              <i>untagged</i>
            )}
          </p>
        </>
      ))}
    </div>
  );
}

const StyledTag = styled.span`
  background-color: #ddd;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
`;
