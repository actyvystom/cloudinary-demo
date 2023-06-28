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
            <StyledImage
              key={image.public_id}
              src={image.url}
              width={image.width}
              height={image.height}
              alt={`Image-Id: ${image.public_id}`}
            />
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
  width: 100vw;
  height: auto;
`;
const StyledListItem = styled.li`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ccc;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-items: center;
`;
const StyledImage = styled(Image)`
  border-radius: 0.5rem;
  width: 90vw;
  object-fit: contain;
  height: auto;
  border-color: aliceblue;
`;
