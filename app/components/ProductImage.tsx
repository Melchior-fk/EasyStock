import Image from 'next/image';
import React from 'react'

interface ProductImageProps {
    src?: string;
    alt?: string;
    heightClass?: string;
    widthClass?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({src, alt, heightClass, widthClass}) => {
  return (
    <div className='avatar'>
        <div className={`rounded-2xl ${heightClass} ${widthClass}`}>
            <Image src={src ?? '/placeholder.png'} alt={alt ?? 'Product image'} quality={100} className='object-cover' height={500} width={500}/>
        </div>
    </div>
  )
}

export default ProductImage

