export function getProductImageFallback(name) {
  const slug = encodeURIComponent(name?.substring(0, 30) || "Product");
  return `https://placehold.co/200x200/f1f5f9/94a3b8?text=${slug}`;
}

export function getImageProps(src, alt) {
  const fallback = getProductImageFallback(alt);
  return {
    src: src || fallback,
    onError: (e) => {
      if (e.target.src !== fallback) {
        e.target.src = fallback;
      }
    },
  };
}
