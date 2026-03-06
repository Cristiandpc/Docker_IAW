import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Page.css';

function Page({ slug }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/api';

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cms/api/pages?filters[slug][$eq]=${slug}&populate=*`);
      const pageData = response.data.data?.[0];
      setPage(pageData);
      setError(null);
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Error al cargar la página');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Cargando página...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!page) return <div className="page-not-found">Página no encontrada</div>;

  return (
    <div className="page-container">
      <h1>{page.attributes.title}</h1>
      {page.attributes.content && (
        <div 
          className="page-content"
          dangerouslySetInnerHTML={{ __html: page.attributes.content }}
        />
      )}
      {page.attributes.image?.data && (
        <img
          src={`${API_URL}/cms${page.attributes.image.data.attributes.url}`}
          alt={page.attributes.title}
          className="page-image"
        />
      )}
    </div>
  );
}

export default Page;