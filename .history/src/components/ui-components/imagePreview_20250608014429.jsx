<ImagePreview
  images={images}
  onImageClick={(i) => setPreviewIndex(i)}
  onDelete={(i) => {
    const updated = [...images]
    updated.splice(i, 1)
    setImages(updated)
  }}
/>
