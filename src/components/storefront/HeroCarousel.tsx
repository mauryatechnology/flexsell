"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Slide {
  title: string;
  highlight: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
}

interface HeroCarouselProps {
  slides: Slide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[320px] md:h-[480px] bg-secondary overflow-hidden group">
      {/* Slides Wrapper */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 w-full h-full flex items-center transition-all duration-700 ease-in-out ${idx === current ? "opacity-100 translate-x-0 z-10" : "opacity-0 translate-x-4 z-0 pointer-events-none"}`}
          >
            {/* Slide Background Image */}
            {slide.imageUrl && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover opacity-35"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              </div>
            )}
            
            {/* Content Container */}
            <div className="mx-auto max-w-7xl px-4 md:px-6 z-10 w-full">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                  {slide.title} <span className="text-primary">{slide.highlight}</span>
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground max-w-lg">
                  {slide.subtitle}
                </p>
                <div className="pt-2">
                  <Link href={slide.buttonLink || "/products"}>
                    <Button size="lg" className="font-bold shadow-md hover:scale-[1.02] transition-transform">
                      {slide.buttonText || "Explore Catalog"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav Controls */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background text-foreground p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background text-foreground p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${current === idx ? "bg-primary w-4" : "bg-muted-foreground/45 w-2"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
