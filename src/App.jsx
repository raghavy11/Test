import React, { useState, useRef, useEffect } from "react";

// Basic styling for the component
const styles = {
  container: {
    fontFamily: "sans-serif",
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  imageContainer: {
    position: "relative",
    display: "inline-block", // Important for positioning the overlay
    cursor: "crosshair",
    marginTop: "20px",
  },
  image: {
    maxWidth: "100%",
    display: "block",
  },
  cropBox: {
    position: "absolute",
    border: "2px solid rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    boxSizing: "border-box",
  },
  previewContainer: {
    marginTop: "20px",
  },
  previewCanvas: {
    border: "1px solid #aaa",
    marginTop: "10px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "20px",
  },
  coords: {
    background: "#f0f0f0",
    padding: "8px",
    borderRadius: "4px",
    marginTop: "10px",
    display: "inline-block",
  },
};

export default function ImageCropper() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState(null); // { x, y, width, height }
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      setCrop(null); // Reset crop on new image
    }
  };

  const getRelativeCoords = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const { x, y } = getRelativeCoords(e);
    setStartPos({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const { x: currentX, y: currentY } = getRelativeCoords(e);
    const { width: imgWidth, height: imgHeight } =
      imageRef.current.getBoundingClientRect();

    // Enforce boundary checks
    const newX = Math.min(startPos.x, currentX);
    const newY = Math.min(startPos.y, currentY);
    const newWidth = Math.abs(currentX - startPos.x);
    const newHeight = Math.abs(currentY - startPos.y);

    setCrop({
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: Math.min(newWidth, imgWidth - newX),
      height: Math.min(newHeight, imgHeight - newY),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    if (!crop || crop.width === 0 || crop.height === 0) {
      console.log("No crop area selected.");
      return;
    }
    console.log("Applied Crop Details:", {
      ...crop,
      originalImageDetails: {
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      },
    });
  };

  // Effect to draw the preview on the canvas
  useEffect(() => {
    if (!crop || !imageSrc || !imageRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imageRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");

    // Scaling factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas dimensions to match crop aspect ratio
    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [crop, imageSrc]);

  return (
    <div style={styles.container}>
      <h2>Interactive Image Cropper</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {imageSrc && (
        <>
          <div
            style={styles.imageContainer}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves container
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Upload Preview"
              style={styles.image}
            />
            {crop && (
              <div
                style={{
                  ...styles.cropBox,
                  left: `${crop.x}px`,
                  top: `${crop.y}px`,
                  width: `${crop.width}px`,
                  height: `${crop.height}px`,
                }}
              />
            )}
          </div>

          {crop && crop.width > 0 && (
            <div style={styles.coords}>
              <p>
                <strong>X:</strong> {Math.round(crop.x)},<strong> Y:</strong>{" "}
                {Math.round(crop.y)},<strong> Width:</strong>{" "}
                {Math.round(crop.width)},<strong> Height:</strong>{" "}
                {Math.round(crop.height)}
              </p>
            </div>
          )}

          <div style={styles.previewContainer}>
            <h3>Crop Preview</h3>
            <canvas ref={previewCanvasRef} style={styles.previewCanvas} />
          </div>

          <button onClick={handleApplyCrop} style={styles.button}>
            Apply Crop
          </button>
        </>
      )}
    </div>
  );
}
