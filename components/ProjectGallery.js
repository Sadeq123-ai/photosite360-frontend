import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

function ProjectGallery() {
  const { projectId } = useParams();
  const [images, setImages] = useState([]);

  useEffect(() => {
    const mockImages = [
      { id: 1, url: 'https://picsum.photos/800/600?random=1', name: 'Imagen 1', thumbnail: 'https://picsum.photos/200/150?random=1' },
      { id: 2, url: 'https://picsum.photos/800/600?random=2', name: 'Imagen 2', thumbnail: 'https://picsum.photos/200/150?random=2' },
      { id: 3, url: 'https://picsum.photos/800/600?random=3', name: 'Imagen 3', thumbnail: 'https://picsum.photos/200/150?random=3' },
    ];
    setImages(mockImages);
  }, [projectId]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Galería del Proyecto {projectId}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {images.map((image) => (
          <Link 
            key={image.id} 
            to={`/projects/${projectId}/images/${image.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
              <img 
                src={image.thumbnail} 
                alt={image.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'center', marginTop: '10px' }}>{image.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectGallery; 
