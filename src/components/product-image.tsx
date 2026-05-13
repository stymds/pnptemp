import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}

// Next's dev-mode image optimizer refuses upstreams whose DNS resolves to
// addresses it considers "private" — including IPv6 NAT64 (64:ff9b::*) of
// public IPs, which Windows often returns for Cloudflare-fronted hosts like
// Supabase Storage. We skip optimization for absolute URLs so the browser
// fetches the WebP directly. /public paths still go through the optimizer.
function isExternal(src: string) {
  return src.startsWith('http://') || src.startsWith('https://');
}

export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 80vw, 25vw',
  className = '',
  imageClassName = '',
}: ProductImageProps) {
  return (
    <div className={`product-image ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={isExternal(src)}
        className={`product-image-img ${imageClassName}`.trim()}
      />
    </div>
  );
}

export function EditorialImage({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
}: ProductImageProps) {
  return (
    <div className={`editorial-image ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={isExternal(src)}
        className="editorial-image-img"
      />
    </div>
  );
}
