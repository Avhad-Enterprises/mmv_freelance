import React from "react";

// Reusable Iframe Component
const PreviewIframe = ({ src, width, height, style, title }) => {
  return (
    <iframe
      src={src}
      frameBorder="0"
      className="preview-iframe"
      style={{ width, height, display: "block", ...style }}
      title={title}
    ></iframe>
  );
};

export default PreviewIframe;