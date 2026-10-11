import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/** Image with graceful fallback so a broken URL never leaves an empty hole in the layout. */
export default function SmartImage({ src, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt || 'Image unavailable'}>
        <ImageOff size={28} aria-hidden="true" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} {...rest} />;
}
