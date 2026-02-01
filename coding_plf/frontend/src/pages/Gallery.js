const Gallery = ({ images }) => {
  if (!images?.length) return null;

  return (
    <section className="bg-gray-900 text-white py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Gallery
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-10">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Gallery"
            className="rounded-lg shadow-lg hover:scale-105 transition"
          />
        ))}
      </div>
    </section>
  );
};

export default Gallery;