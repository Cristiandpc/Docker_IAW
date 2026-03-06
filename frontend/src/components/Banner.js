import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Banner.css';

function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/api';

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cms/api/banners?populate=*`);
      setBanners(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Error al cargar los banners');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="banner-loading">Cargando banners...</div>;
  if (error) return <div className="banner-error">{error}</div>;
  if (banners.length === 0) return null;

  return (
    <div className="banner-container">
      {banners.map((banner) => (
        <div key={banner.id} className="banner">
          {banner.attributes.image?.data && (
            <img
              src={`${API_URL}/cms${banner.attributes.image.data.attributes.url}`}
              alt={banner.attributes.title}
              className="banner-image"
            />
          )}
          <div className="banner-content">
            <h2>{banner.attributes.title}</h2>
            <p>{banner.attributes.description}</p>
            {banner.attributes.link && (
              <a href={banner.attributes.link} className="banner-link">
                {banner.attributes.linkText || 'Ver más'}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Banner;