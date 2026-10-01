"use client";

import Link from "next/link";

interface StoryItem {
  vendeurId: string;
  nomBoutique: string;
  photo: string;
  storyId: string;
}

export default function Stories({ stories }: { stories: StoryItem[] }) {
  if (stories.length === 0) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{
        fontSize: "12px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "10px",
        letterSpacing: "0.8px",
        textTransform: "uppercase",
      }}>
        Stories
      </h2>

      <div style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        paddingBottom: "6px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {stories.map((story) => (
          <Link
            key={story.storyId}
            href={`/acheteur/stories/${story.storyId}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
              textDecoration: "none",
              flexShrink: 0,
              width: "68px",
            }}
          >
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              padding: "3px",
              background: "linear-gradient(135deg, #F97316 0%, #EC4899 50%, #8B5CF6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                padding: "2px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img
                  src={story.photo}
                  alt={story.nomBoutique}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>

            <span style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#334155",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "68px",
            }}>
              {story.nomBoutique}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
            }
