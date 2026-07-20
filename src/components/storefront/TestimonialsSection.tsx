"use client";

import * as React from "react";
import Image from "next/image";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, Video, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface TestimonialItem {
  id?: string;
  name: string;
  business: string;
  location: string;
  rating: number;
  text: string;
  contentType: "text" | "image" | "video";
  mediaUrl?: string;
  mediaUpload?: string;
  avatarUrl?: string;
  avatarUpload?: string;
  isActive?: boolean;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: TestimonialItem[];
  type?: "wholesale" | "dropshipper" | "client";
}

export function TestimonialsSection({
  title,
  subtitle,
  testimonials,
  type = "wholesale"
}: TestimonialsSectionProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [activeDot, setActiveDot] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const defaultTestimonials: TestimonialItem[] = [
    {
      name: "Rajesh Sharma",
      business: "Sharma Traders",
      location: "Indore, MP",
      rating: 5,
      text: "FlexSell changed my kitchen gadget retail business. Direct Surat warehouse cargo pricing gave me a 35% margin boost!",
      contentType: "text"
    },
    {
      name: "Ananya Patel",
      business: "SmartDrop Online Store",
      location: "Ahmedabad, Gujarat",
      rating: 5,
      text: "The dropshipping fulfillment speed is unmatched. My Shopify orders get dispatched within 24 hours with custom packaging.",
      contentType: "text"
    },
    {
      name: "Vikram Malhotra",
      business: "Malhotra Gifts",
      location: "Jaipur, Rajasthan",
      rating: 5,
      text: "Zero damaged goods in transit. Their packaging line quality screening makes buying container cargo safe and easy.",
      contentType: "text"
    },
    {
      name: "Suresh Gupta",
      business: "Gupta Utilities",
      location: "Delhi NCR",
      rating: 5,
      text: "Instant GST invoices with tax credit. Ordering bulk inventory directly from Surat saved us thousands every month.",
      contentType: "text"
    }
  ];

  const activeItems = (testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials).filter(
    (item) => item.isActive !== false
  );

  const cardWidth = 340; // width + gap step

  // Auto-slide 1 card every 5 seconds (paused when hovered or dragging)
  React.useEffect(() => {
    if (activeItems.length <= 1 || isHovered || isMouseDown) return;
    const timer = setInterval(() => {
      if (scrollContainerRef.current) {
        const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
        if (scrollContainerRef.current.scrollLeft >= maxScroll - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [activeItems.length, isHovered, isMouseDown]);

  // Update active dot indicator on scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const index = Math.round(currentScroll / cardWidth);
    setActiveDot(Math.min(index, activeItems.length - 1));
  };

  // Robust Global Window Mouse Drag Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    const ele = scrollContainerRef.current;
    const startX = e.pageX - ele.offsetLeft;
    const initialScrollLeft = ele.scrollLeft;
    setIsMouseDown(true);

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const x = moveEvent.pageX - ele.offsetLeft;
      const walk = (x - startX) * 1.5;
      ele.scrollLeft = initialScrollLeft - walk;
    };

    const handleWindowMouseUp = () => {
      setIsMouseDown(false);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  if (activeItems.length === 0) return null;

  const sectionTitle = title || (type === "dropshipper" ? "What Dropship Partners Say" : type === "client" ? "Customer Reviews" : "Wholesale Buyer Feedback");
  const sectionSubtitle = subtitle || "Real verified reviews from active commercial partners using FlexSell sourcing.";

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  const scrollToIndex = (idx: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
    }
  };

  return (
    <section 
      className="mx-auto max-w-8xl px-4 md:px-6 w-full py-8 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Bar */}
      <div className="flex justify-between items-end mb-6 border-b pb-4 border-border/60">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {sectionTitle}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
        </div>

        {/* 1-by-1 Arrow Slide Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollLeft}
            className="p-2.5 rounded-full border bg-card hover:bg-secondary text-foreground shadow-sm transition-all cursor-pointer hover:scale-105"
            aria-label="Scroll left 1 card"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="p-2.5 rounded-full border bg-card hover:bg-secondary text-foreground shadow-sm transition-all cursor-pointer hover:scale-105"
            aria-label="Scroll right 1 card"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Smooth Mouse Drag & Touch Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onDragStart={(e) => e.preventDefault()}
        className={`flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 touch-pan-x ${
          isMouseDown ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {activeItems.map((item, idx) => {
          const activeMedia = item.mediaUpload || item.mediaUrl || "";
          const activeAvatar = item.avatarUpload || item.avatarUrl || "";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onDragStart={(e) => e.preventDefault()}
              className="w-[280px] sm:w-[320px] md:w-[340px] h-[460px] flex-shrink-0 rounded-2xl border border-border bg-card p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group select-none"
            >
              <Quote className="absolute top-3 right-3 h-14 w-14 text-muted/15 pointer-events-none" />

              {/* Top Details & Ratings */}
              <div className="space-y-3 relative z-10 flex-1 flex flex-col justify-between pointer-events-none">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    {/* Star Ratings */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (item.rating || 5) ? "fill-amber-400 text-amber-400" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>

                    {item.contentType !== "text" && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                        {item.contentType === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                        {item.contentType}
                      </span>
                    )}
                  </div>

                  {/* Reel Cut Vertical Media Player or Photo Thumbnail */}
                  {item.contentType !== "text" && activeMedia ? (
                    <div className="w-full h-[220px] relative rounded-xl overflow-hidden bg-black border border-border mb-3 shadow-inner pointer-events-auto">
                      {item.contentType === "image" ? (
                        <Image
                          src={activeMedia}
                          alt={item.name}
                          fill
                          draggable={false}
                          className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                          sizes="340px"
                        />
                      ) : (
                        <div className="w-full h-full relative flex items-center justify-center">
                          {activeMedia.includes("youtube") || activeMedia.includes("vimeo") ? (
                            <iframe
                              src={activeMedia}
                              className="w-full h-full"
                              allowFullScreen
                              title={item.name}
                            />
                          ) : (
                            <video src={activeMedia} controls className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Review Quote Text */}
                  <p className="text-xs sm:text-sm text-foreground italic leading-relaxed font-medium line-clamp-4">
                    "{item.text}"
                  </p>
                </div>
              </div>

              {/* Bottom Customer Info */}
              <div className="flex items-center gap-3 pt-4 mt-3 border-t border-border/60 relative z-10 shrink-0 pointer-events-none">
                {activeAvatar ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-primary/30 shrink-0">
                    <Image src={activeAvatar} alt={item.name} fill draggable={false} className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20 shrink-0">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1 truncate">
                    {item.name} <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.business} • {item.location}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bullet Dots Navigation */}
      {activeItems.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {activeItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                activeDot === idx ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/60 w-2.5"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
