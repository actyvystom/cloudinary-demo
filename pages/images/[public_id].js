import { useRouter } from "next/router";
import useSWR from "swr";
import Image from "next/image";
import styled from "styled-components";
import { StyledTag } from "../../components/ImageList";
export default function ImageDetail() {
  const router = useRouter();
  const { public_id } = router.query;
  const { data, loading, error } = useSWR(`/api/images/${public_id}`);
  if (loading) return <div>loading...</div>;
  if (error) return <div>failed to load</div>;
  if (data) {
    const image = data.resources[0];
    console.log(image);
    const uploadDate = new Date(image.uploaded_at);
    return (
      <StyledSection>
        <Image
          key={image.public_id}
          src={image.url}
          width={image.width}
          height={image.height}
          layout="responsive"
          priority={true}
          alt={`Image-Id: ${image.public_id}`}
        />
        <StyledDescription>{`Path in Media Library: /${image.folder}`}</StyledDescription>
        <StyledDescription>{`Image-Id: ${image.public_id}`}</StyledDescription>
        <StyledDescription>
          {image.tags.length > 0 ? (
            image.tags.map((tag, index) => (
              <StyledTag key={`tag-${index}`}>{tag}</StyledTag>
            ))
          ) : (
            <i>untagged</i>
          )}
        </StyledDescription>
        <StyledDescription>
          <strong>Date uploaded: </strong>{" "}
          {uploadDate.toLocaleDateString("de-DE", {
            month: "2-digit",
            year: "numeric",
            day: "2-digit"
          })}
        </StyledDescription>
      </StyledSection>
    );
  }
}
const StyledSection = styled.section`
  width: 95vw;
  height: auto;
`;
const StyledDescription = styled.p`
  font-size: 0.8rem;
`;
