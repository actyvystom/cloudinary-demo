import useSWR from "swr";
import Image from "next/image";
import styled from "styled-components";
import Link from "next/link";

export default function ImageList() {
  const { data, error } = useSWR("/api/images");
  if (error) return <div>failed to load</div>;
  if (!data) return <div>is loading...</div>;
  return (
    <StyledList>
      {data.resources.map((image) => (
        <StyledListItem key={image.asset_id}>
          <Image
            src={image.url}
            height={image.height}
            width={image.width}
            layout="responsive"
            alt={`Image-ID: ${image.public_id}`}
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
        </StyledListItem>
      ))}
    </StyledList>
  );
}

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
`;
const StyledListItem = styled.li`
  margin-bottom: 2rem;
  border-bottom: 1px solid #ccc;
`;

const StyledTag = styled.span`
  background-color: #ddd;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
`;
