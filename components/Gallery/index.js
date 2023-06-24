import useSWR from "swr";
import Image from "next/image";
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
                <span key={`pic-${index}`}>{tag}</span>
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
