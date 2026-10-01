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
          height: "180px",
          backgroundColor: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
          borderRadius: "12px",
        }}
      >
        📦
      </div>
    );
  }

  return (
    <div>
      {/* Grande photo — s'adapte à la taille réelle, sans fond blanc */}
      <div
        style={{
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          minHeight: "140px",
          maxHeight: "280px",
        }}
      >
        <img
          src={photos[photoActive]}
          alt={nomProduit}
          style={{
            maxWidth: "100%",
            maxHeight: "280px",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Miniatures */}
      {photos.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setPhotoActive(index)}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "8px",
                border: photoActive === index ? "2px solid #1D4ED8" : "1px solid #E8DFC8",
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
