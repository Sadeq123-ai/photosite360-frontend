import React, { useState, useEffect } from '"react"; 
import { useParams, useNavigate } from '"react-router-dom"; 
 
function ImageViewer() { 
  const { projectId, imageId } = useParams(); 
  const navigate = useNavigate(); 
  const [images, setImages] = useState([]); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
 
  useEffect(() =
    const mockImages = [ 
      { id: 1, url: '"https://picsum.photos/800/600?random=1", name: '"Imagen 1" }, 
      { id: 2, url: '"https://picsum.photos/800/600?random=2", name: '"Imagen 2" }, 
      { id: 3, url: '"https://picsum.photos/800/600?random=3", name: '"Imagen 3" }, 
    ]; 
    setImages(mockImages); 
  }, [projectId]); 
 
  useEffect(() =
    if (images.length > 0 && imageId) { 
      const index = images.findIndex(img = === parseInt(imageId)); 
      if (index !== -1) { 
        setCurrentImageIndex(index); 
      } 
    } 
  }, [imageId, images]); 
 
  useEffect(() =
    if (images.length > 0) { 
      const currentImageId = images[currentImageIndex].id; 
      navigate(newUrl, { replace: true }); 
    } 
  }, [currentImageIndex, images, projectId, navigate]); 
 
  const nextImage = () =
    setCurrentImageIndex((prev) = === images.length - 1 ? 0 : prev + 1); 
  }; 
 
  const prevImage = () =
    setCurrentImageIndex((prev) = === 0 ? images.length - 1 : prev - 1); 
  }; 
 
  const copyCurrentUrl = () =
    const currentUrl = window.location.href; 
    navigator.clipboard.writeText(currentUrl) 
      .then(() =
        alert('"URL copiada: '" + currentUrl); 
      }) 
      .catch(err =
        console.error('"Error al copiar URL:", err); 
      }); 
  }; 
 
  if (images.length === 0) return '"<div^>Cargando im genes...^</div^>"; 
 
  return ( 
    '"<div style={{ padding: '"'20px'"' }}^>"
      '"<div style={{ marginBottom: '"'20px'"' }}^>"
        '"<h2^>Proyecto '"${projectId}"' - Imagen '"${currentImageIndex + 1}"'^</h2^>"
        '"<button onClick={copyCurrentUrl} style={{ padding: '"'10px'"', margin: '"'10px'"' }}^>"
          Copiar URL Actual 
        '"/button^>"
      '"/div^>"
 
      '"<div style={{ textAlign: '"'center'"', marginBottom: '"'20px'"' }}^>"
      '"/div^>"
 
      '"<div style={{ textAlign: '"'center'"', marginBottom: '"'20px'"' }}^>"
        '"<button onClick={prevImage} style={{ padding: '"'10px'"', margin: '"'5px'"' }}^> Anterior^</button^>"
        '"<span style={{ margin: '"'0 20px'"' }}^>Imagen '"${currentImageIndex + 1}"' de '"${images.length}"'^</span^>"
        '"<button onClick={nextImage} style={{ padding: '"'10px'"', margin: '"'5px'"' }}^>Siguiente ^</button^>"
      '"/div^>"
    '"/div^>"
  ); 
} 
 
export default ImageViewer; 
