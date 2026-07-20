'use client';

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { Flame } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const highlight = useMotionTemplate`radial-gradient(150px circle at ${x}px ${y}px, rgba(255,255,255,0.3), transparent 80%)`;

  const hasMultipleImages = Array.isArray(product.images) && product.images.length > 1;
  const secondImageUrl = hasMultipleImages ? product.images[1] : null;
  const lowestPrice = product.price_30x40 || 0;

  return (
    <div
      className="group perspective-[1000px]"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative overflow-hidden rounded-2xl bg-[#F4F4F4] aspect-[3/4]"
        >
          {/* 3D Content Container */}
          <div className="relative h-full w-full" style={{ transform: "translateZ(20px)" }}>
            {hasMultipleImages && (
              <Image
                src={secondImageUrl!}
                alt={`${product.title} - ракурс 2`}
                fill
                className="object-cover z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              priority={priority}
              className={`object-cover z-10 transition-opacity duration-500 ${hasMultipleImages ? 'group-hover:opacity-0' : ''}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            
            {/* Specular Highlight */}
            <motion.div 
                className="absolute inset-0 z-20 pointer-events-none"
                style={{ background: highlight }}
            />
          </div>

          {/* Бейджи */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-30" style={{ transform: "translateZ(40px)" }}>
            {product.featured && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-[#F97316] text-white font-bold h-6 min-w-[72px] px-3 rounded-full uppercase tracking-wider flex items-center justify-center gap-1 text-[10px]"
              >
                <Flame size={12} fill="currentColor" />
                Хит
              </motion.div>
            )}
            {product.category && (
              <span className="bg-white/90 backdrop-blur-sm text-[#111111] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                {product.category.name}
              </span>
            )}
          </div>
        </motion.div>

        {/* Текст */}
        <div className="mt-4 px-1">
          <p className="font-bold text-[#111111] text-sm tracking-tight leading-snug line-clamp-1">
            {product.title}
          </p>
          <p className="text-[#666666] text-sm mt-1 font-medium">
            от {formatPrice(lowestPrice)}
          </p>
        </div>
      </Link>
    </div>
  );
}
