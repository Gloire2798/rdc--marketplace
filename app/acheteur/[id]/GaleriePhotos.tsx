"use client";

import { useState } from "react";

export default function GaleriePhotos({
  photos,
  nomProduit,
}: {
  photos: string[];
  nomProduit: string;
}) {
  const [photoActive, setPhotoActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "300px",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "60px",
          borderRadius: "16px",
        }}
      >
        📦
      </div>
    );
  }

  return (
    <div>
      {/* Grande photo */}
      <div
        style={{
          width: "100%",
          height: "300px",
          backgroundColor: "#f9fafb",
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={photos[photoActive]}
          alt={nomProduit}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Miniatures */}
      {photos.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setPhotoActive(index)}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "10px",
                border: photoActive === index ? "3px solid #2563eb" : "1px solid #d1d5db",
                padding: "2px",
                backgroundColor: "white",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
      }
