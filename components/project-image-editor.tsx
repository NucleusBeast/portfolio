"use client";

import { useMutation } from "convex/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProjectImageFrame } from "@/components/project-carousel";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type ProjectImage = {
  key: string;
  previewUrl: string | null;
} & (
  | { imageId: Id<"_storage">; file?: never }
  | { file: File; imageId?: never }
);

export function useProjectImages() {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const previewUrls = useRef(new Set<string>());
  const generateUploadUrl = useMutation(api.models.projects.generateUploadUrl);

  useEffect(
    () => () => {
      for (const url of previewUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );

  function addFiles(
    files: FileList | null,
    onError: (message: string) => void,
  ) {
    const additions: ProjectImage[] = [];
    for (const file of Array.from(files ?? [])) {
      if (!file.type.startsWith("image/")) {
        onError("Only image files are allowed.");
      } else if (file.size > 5 * 1024 * 1024) {
        onError("Each image must be 5 MB or smaller.");
      } else {
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.add(previewUrl);
        additions.push({ key: previewUrl, previewUrl, file });
      }
    }
    setImages((current) => [...current, ...additions]);
  }

  async function uploadImages(onProgress: (progress: number) => void) {
    const fileCount = images.filter((image) => image.file).length;
    let completed = 0;
    return Promise.all(
      images.map(async (image) => {
        if (!image.file) return image.imageId;
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.file.type },
          body: image.file,
        });
        if (!response.ok) throw new Error("Image upload failed");
        const { storageId } = (await response.json()) as {
          storageId: Id<"_storage">;
        };
        completed += 1;
        onProgress(Math.round((completed / fileCount) * 100));
        return storageId;
      }),
    );
  }

  return { images, setImages, addFiles, uploadImages };
}

export function ProjectImageEditor({
  images,
  onChange,
  disabled,
}: {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  disabled: boolean;
}) {
  function move(index: number, offset: number) {
    const next = [...images];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  if (!images.length) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Use the arrows to reorder images. The first image is the cover. Save the
        project to apply changes.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image, index) => (
          <div
            key={image.key}
            className="overflow-hidden rounded-lg border bg-muted"
          >
            <div className="aspect-video">
              {image.previewUrl ? (
                <ProjectImageFrame
                  src={image.previewUrl}
                  alt={`Project image ${index + 1}`}
                  width={960}
                  height={540}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Image unavailable
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 bg-background p-2">
              <span className="mr-auto text-sm">
                {index + 1}
                {index === 0 ? " · Cover" : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled || index === 0}
                aria-label={`Move image ${index + 1} left`}
                onClick={() => move(index, -1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled || index === images.length - 1}
                aria-label={`Move image ${index + 1} right`}
                onClick={() => move(index, 1)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disabled}
                aria-label={`Remove image ${index + 1}`}
                onClick={() => onChange(images.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
