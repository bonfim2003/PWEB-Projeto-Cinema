import React from "react";

export const Image = React.forwardRef(({ src, alt = "", className = "", fittingType, originWidth, originHeight, focalPointX, focalPointY, quality, ...props }, ref) => {
  return (
    <img
      ref={ref}
      src={src || "/logo.png"}
      alt={alt}
      loading="lazy"
      className={`object-cover ${className}`}
      {...props}
    />
  );
});
Image.displayName = "Image";