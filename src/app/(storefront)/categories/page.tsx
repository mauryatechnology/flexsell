import * as React from "react";
import Link from "next/link";
import { categories } from "@/data/categories";
import { Card } from "@/components/ui/Card";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Shop by Category</h1>
        <p className="text-muted-foreground mt-2">Explore our wide range of wholesale products across all categories</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.filter(c => !c.parentId).map((category) => (
          <Link key={category._id} href={`/categories/${category.slug}`}>
            <Card className="hover:border-primary transition-all hover:shadow-md cursor-pointer text-center overflow-hidden h-full flex flex-col group">
              <div className="aspect-video relative bg-secondary overflow-hidden">
                <img
                  src={category.image || `https://placehold.co/600x400/10b981/ffffff?text=${encodeURIComponent(category.name)}`}
                  alt={category.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col flex-1 justify-center">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
