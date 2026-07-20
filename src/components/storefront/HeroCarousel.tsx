"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BannerSlide {
  imageUrl: string;
  mobileImageUrl?: string;
  redirectUrl: string;
  altText?: string;
}

interface HeroCarouselProps {
  slides: BannerSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const router = useRouter();
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  React.useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleBannerClick = (url: string) => {
    if (!url) return;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  const currentSlide = slides[current];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0
    })
  };

  return (
    <section className="relative w-full h-[240px] sm:h-[360px] md:h-[460px] lg:h-[540px] 2xl:h-[640px] bg-secondary overflow-hidden group select-none">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -10000 || offset.x < -100) {
              nextSlide();
            } else if (swipe > 10000 || offset.x > 100) {
              prevSlide();
            }
          }}
          onClick={() => handleBannerClick(currentSlide.redirectUrl || "/products")}
          className="absolute inset-0 w-full h-full cursor-pointer"
        >
          {/* Desktop Banner Image */}
          <div className={`relative w-full h-full ${currentSlide.mobileImageUrl ? "hidden sm:block" : "block"}`}>
            <Image
              src={currentSlide.imageUrl || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80"}
              alt={currentSlide.altText || "FlexSell Wholesale Banner"}
              fill
              priority={current === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Mobile Specific Image if available */}
          {currentSlide.mobileImageUrl && (
            <div className="relative w-full h-full block sm:hidden">
              <Image
                src={currentSlide.mobileImageUrl}
                alt={currentSlide.altText || "FlexSell Wholesale Banner"}
                fill
                priority={current === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav Arrow Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer hover:scale-110"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Bullet Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(idx > current ? 1 : -1);
                  setCurrent(idx);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  current === idx ? "bg-primary w-6" : "bg-white/60 hover:bg-white w-2.5"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
