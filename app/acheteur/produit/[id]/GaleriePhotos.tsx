"use client";

import { useState } from "react";
import { Package } from "lucide-react";

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
          aspectRatio: "1 / 1",
          backgroundColor: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "20px",
          border: "2px solid #0F172A",
          boxShadow: "6px 6px 0 #EA580C",
        }}
      >
        <Package size={56} color="#CBD5E1" strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <div>
      {/* GRANDE PHOTO — bord noir + ombre orange */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          backgroundColor: "white",
          borderRadius: "20px",
          border: "2px solid #0F172A",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        <img
          src={photos[photoActive]}
          alt={nomProduit}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
            padding: "8px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* MINIATURES */}
      {photos.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {photos.map((photo, index) => {
            const active = photoActive === index;
            return (
              <button
                key={index}
                onClick={() => setPhotoActive(index)}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  border: active ? "2px solid #0F172A" : "2px solid #E5E5E5",
                  padding: "2px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  overflow: "hidden",
                  boxShadow: active ? "3px 3px 0 #EA580C" : "none",
                  transition: "box-shadow 0.15s ease, border 0.15s ease",
                }}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "8px",
                    display: "block",
                    padding: "2px",
                    boxSizing: "border-box",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
