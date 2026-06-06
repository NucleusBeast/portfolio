"use client";

import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectImageFrameProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

type ProjectCarouselProps = {
  imageUrls: string[];
  alt: string;
  className?: string;
};

export function ProjectImageFrame({
  src,
  alt,
  width,
  height,
  className,
}: ProjectImageFrameProps) {
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        className={cn(
          "absolute inset-0 h-full w-full scale-110 object-cover opacity-0 blur-xl transition-opacity duration-300",
          isPortrait && "opacity-55",
        )}
        unoptimized
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "relative z-10 h-full w-full transition-[object-fit] duration-300",
          isPortrait ? "object-contain" : "object-cover",
        )}
        onLoad={(event) => {
          const image = event.currentTarget;
          setIsPortrait(image.naturalHeight > image.naturalWidth);
        }}
        unoptimized
      />
    </div>
  );
}

export function ProjectCarousel({
  imageUrls,
  alt,
  className,
}: ProjectCarouselProps) {
  const [index, setIndex] = useState(0);

  if (imageUrls.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
      </div>
    );
  }

  const hasMany = imageUrls.length > 1;

  const showPrev = () => {
    setIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const showNext = () => {
    setIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn("relative h-full w-full", className)}>
      <ProjectImageFrame
        src={imageUrls[index]}
        alt={alt}
        width={640}
        height={360}
      />
      {hasMany ? (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              showPrev();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              showNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-background/80 px-2 py-0.5 text-xs">
            {index + 1}/{imageUrls.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
