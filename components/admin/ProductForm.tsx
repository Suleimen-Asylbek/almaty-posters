"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

type ImageEntry = {
  file?: File;
  preview: string;
  uploading?: boolean;
};

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? categories[0]?.id ?? "",
  );
  const [price30x40, setPrice30x40] = useState(
    product?.price_30x40?.toString() ?? "9000",
  );
  const [price40x50, setPrice40x50] = useState(
    product?.price_40x50?.toString() ?? "16000",
  );
  const [price50x70, setPrice50x70] = useState(
    product?.price_50x70?.toString() ?? "25000",
  );
  const [isNew, setIsNew] = useState(product?.is_new ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const initialImages = useMemo(() => {
    if (product?.images?.length) {
      return product.images.map((url) => ({ preview: url }));
    }

    if (product?.image_url) {
      return [{ preview: product.image_url }];
    }

    return [] as ImageEntry[];
  }, [product?.image_url, product?.images]);

  const [images, setImages] = useState<ImageEntry[]>(initialImages);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageEntriesRef = useRef<ImageEntry[]>(images);

  useEffect(() => {
    imageEntriesRef.current = images;
  }, [images]);

  useEffect(() => {
    if (images.length === 0) {
      setSelectedImageIndex(0);
      return;
    }

    if (selectedImageIndex >= images.length) {
      setSelectedImageIndex(images.length - 1);
    }
  }, [images, selectedImageIndex]);

  useEffect(() => {
    return () => {
      imageEntriesRef.current.forEach((entry) => {
        if (entry.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(entry.preview);
        }
      });
    };
  }, []);

  useEffect(() => {
    setImages((prev) => {
      prev.forEach((entry) => {
        if (entry.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(entry.preview);
        }
      });

      return initialImages;
    });
    setSelectedImageIndex(0);
  }, [initialImages]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} слишком большой (максимум 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
            file,
            preview: event.target?.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.preview);
      }

      const updated = prev.filter((_, itemIndex) => itemIndex !== index);
      return updated;
    });

    setSelectedImageIndex((prev) => Math.max(0, Math.min(prev, Math.max(0, images.length - 2))));
  }

  function moveImageUp(index: number) {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      return updated;
    });
  }

  function moveImageDown(index: number) {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  }

  async function uploadImages(): Promise<string[]> {
    if (images.length === 0) {
      throw new Error("Добавьте хотя бы одно изображение");
    }

    const urls: string[] = [];
    const supabase = createClient();

    for (let index = 0; index < images.length; index += 1) {
      const entry = images[index];

      if (!entry.file) {
        urls.push(entry.preview);
        continue;
      }

      setImages((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], uploading: true };
        return updated;
      });

      const fileExt = entry.file.name.split(".").pop();
      const fileName = `${slugify(title) || "poster"}-${Date.now()}-${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(fileName, entry.file, { upsert: false });

      if (uploadError) {
        throw new Error(`Ошибка загрузки ${entry.file.name}: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from("posters").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Укажите название постера");
      return;
    }
    if (!categoryId) {
      setError("Выберите категорию");
      return;
    }
    if (images.length === 0) {
      setError("Добавьте хотя бы одно изображение");
      return;
    }

    setSubmitting(true);

    try {
      const imageUrls = await uploadImages();
      const coverImage = imageUrls[0];

      const baseSlug = slugify(title) || "poster";
      const slug =
        isEdit && product?.slug?.startsWith(baseSlug)
          ? product.slug
          : `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        image_url: coverImage,
        images: imageUrls,
        price_30x40: Number(price30x40),
        price_40x50: Number(price40x50),
        price_50x70: Number(price50x70),
        is_new: isNew,
        featured,
        slug,
      };

      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Не удалось сохранить постер");
      }

      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Произошла ошибка");
      setSubmitting(false);
    }
  }

  const uploading = images.some((entry) => entry.uploading);
  const busy = submitting || uploading;
  const selectedImage = images[selectedImageIndex] ?? images[0];

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-semibold text-[#111111] mb-2">
            Изображения постера
          </label>

          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-[#E5E5E5] bg-[#F6F6F6] overflow-hidden flex items-center justify-center">
              {selectedImage ? (
                <>
                  <Image
                    src={selectedImage.preview}
                    alt="Превью"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  {selectedImage.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (images.length === 1) {
                        setImages([]);
                        return;
                      }

                      const targetIndex = selectedImageIndex;
                      removeImage(targetIndex);
                    }}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors"
                  >
                    <X size={14} className="text-[#111111]" />
                  </button>
                </>
              ) : (
                <div className="text-center px-6">
                  <Upload size={28} className="mx-auto text-[#999999] mb-3" />
                  <p className="text-sm font-medium text-[#666666]">
                    Нажмите, чтобы загрузить изображения
                  </p>
                  <p className="text-xs text-[#999999] mt-1">PNG, JPG до 5MB</p>
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((entry, index) => (
                  <div key={`${entry.preview}-${index}`} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square w-full overflow-hidden rounded-xl border ${selectedImageIndex === index ? "border-[#111111]" : "border-[#E5E5E5]"}`}
                    >
                      <Image src={entry.preview} alt={`Preview ${index + 1}`} fill className="object-cover" sizes="100px" />
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-full bg-[#111111] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Cover
                        </span>
                      )}
                    </button>

                    <div className="mt-1 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                        className="rounded-full border border-[#E5E5E5] p-1 text-[#111111] disabled:opacity-30"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImageDown(index)}
                        disabled={index === images.length - 1}
                        className="rounded-full border border-[#E5E5E5] p-1 text-[#111111] disabled:opacity-30"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-full border border-red-200 p-1 text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E5E5] px-4 py-3 text-sm font-medium text-[#666666] transition-colors hover:border-[#999999] hover:text-[#111111]"
            >
              <Upload size={16} />
              Добавить ещё фото
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            name="images"
            id="poster-images"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-[#111111] mb-1.5">
              Название (на русском)
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Токийский Гуль"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#111111] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#111111] mb-1.5">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткое эмоциональное описание постера"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-[#111111] mb-1.5">
              Категория
            </label>
            <select
              id="category"
              name="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1.5">
              Цены (₸)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <PriceInput
                label="30×40"
                name="price30x40"
                value={price30x40}
                onChange={setPrice30x40}
              />
              <PriceInput
                label="40×50"
                name="price40x50"
                value={price40x50}
                onChange={setPrice40x50}
              />
              <PriceInput
                label="50×70"
                name="price50x70"
                value={price50x70}
                onChange={setPrice50x70}
              />
            </div>
          </div>

          <label htmlFor="featured" className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-[#E5E5E5] accent-[#111111]"
            />
            <span className="text-sm font-medium text-[#111111]">
              Показывать в «Хиты продаж»
            </span>
          </label>

          <label htmlFor="isNew" className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              id="isNew"
              name="isNew"
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              className="w-4 h-4 rounded border-[#E5E5E5] accent-[#111111]"
            />
            <span className="text-sm font-medium text-[#111111]">
              Показывать в «Новинках»
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-10">
        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.01 }}
          whileTap={{ scale: busy ? 1 : 0.98 }}
          className="bg-[#111111] text-white font-semibold px-7 py-3.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {uploading
            ? "Загрузка изображений..."
            : submitting
              ? "Сохранение..."
              : isEdit
                ? "Сохранить изменения"
                : "Добавить постер"}
        </motion.button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          disabled={busy}
          className="px-7 py-3.5 rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#111111] hover:bg-[#F6F6F6] transition-colors disabled:opacity-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

function PriceInput({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-xs text-[#999999] block mb-1">{label}</span>
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
      />
    </div>
  );
}
