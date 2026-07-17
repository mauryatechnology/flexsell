"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import { useCategoryStore } from "@/stores/categoryStore";
import { useToastStore } from "@/stores/toastStore";
import { useConfirmStore } from "@/stores/confirmStore";
import { Category } from "@/types";
import { Pagination } from "@/components/ui/Pagination";

interface AdminCategoriesManagerProps {
  initialCategories: Category[];
}

export function AdminCategoriesManager({ initialCategories }: AdminCategoriesManagerProps) {
  const { categories, initializeCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { addToast } = useToastStore();
  const confirmAction = useConfirmStore((state) => state.confirm);

  const [editCategoryId, setEditCategoryId] = React.useState<string | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [parentId, setParentId] = React.useState("");
  const [order, setOrder] = React.useState(1);

  React.useEffect(() => {
    initializeCategories(initialCategories);
  }, [initialCategories, initializeCategories]);

  const activeCategories = categories.length > 0 ? categories : initialCategories;
  const parentCategories = activeCategories.filter(c => !c.parentId);

  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(activeCategories.length / ITEMS_PER_PAGE);

  const paginatedCategories = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [activeCategories, currentPage]);

  // Load selected category into the form
  const handleEditClick = (cat: Category) => {
    setEditCategoryId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "");
    setOrder(cat.order);
  };

  const handleCancelEdit = () => {
    setEditCategoryId(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setOrder(1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug) {
      addToast("Name and Slug are required.", "warning");
      return;
    }

    const categoryData = {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      parentId: parentId || null,
      order: Number(order),
      image: "https://placehold.co/400x400/10b981/ffffff?text=" + name.split(" ")[0],
      isActive: true
    };

    const performSave = async () => {
      try {
        if (editCategoryId) {
          await updateCategory(editCategoryId, categoryData);
          addToast(`Category "${name}" updated successfully!`, "success");
        } else {
          await addCategory(categoryData);
          addToast(`Category "${name}" created successfully!`, "success");
        }
        handleCancelEdit();
      } catch (error: unknown) {
        addToast((error as any).message || "An error occurred while saving the category.", "error");
      }
    };

    if (editCategoryId) {
      confirmAction({
        title: "Confirm Update",
        message: `Are you sure you want to save changes to the category "${name}"?`,
        confirmText: "Save Changes",
        cancelText: "Cancel",
        type: "warning",
        onConfirm: performSave
      });
    } else {
      await performSave();
    }
  };

  const handleDeleteClick = (cat: Category) => {
    confirmAction({
      title: "Delete Category",
      message: `Are you sure you want to permanently delete category "${cat.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteCategory(cat._id);
          addToast(`Category "${cat.name}" deleted successfully!`, "success");
        } catch (error: unknown) {
          addToast((error as any).message || "An error occurred while deleting the category.", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-1">Configure parent-child taxonomies for your B2B Mega Menu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Middle Column: List of Categories */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-foreground">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4">Category Name</th>
                      <th className="px-6 py-4">Slug</th>
                      <th className="px-6 py-4">Parent Category</th>
                      <th className="px-6 py-4">Sort Order</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedCategories.map((cat) => {
                      const parent = activeCategories.find(c => c._id === cat.parentId);
                      return (
                        <tr key={cat._id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 font-bold">
                            {cat.parentId ? (
                              <span className="text-muted-foreground font-normal ml-3">— </span>
                            ) : null}
                            {cat.name}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{cat.slug}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {parent ? parent.name : "None (Root)"}
                          </td>
                          <td className="px-6 py-4 font-medium">{cat.order}</td>
                          <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditClick(cat)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(cat)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={activeCategories.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add/Edit Form Card */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-foreground">
                {editCategoryId ? "Edit Category" : "Add B2B Category"}
              </CardTitle>
              <CardDescription>
                {editCategoryId ? "Modify catalog properties for this category node" : "Insert a new category into the taxonomy"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4 text-foreground">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Name</label>
                  <Input 
                    placeholder="e.g., Kitchen Storage" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editCategoryId) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Slug</label>
                  <Input 
                    placeholder="e.g., kitchen-storage" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input 
                    placeholder="Description..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent Category (Optional)</label>
                  <select 
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                  >
                    <option value="">None (Root Category)</option>
                    {parentCategories
                      .filter(c => c._id !== editCategoryId) // prevent self-parenting
                      .map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort Order in Dropdown</label>
                  <Input 
                    type="number" 
                    value={order || ""}
                    onChange={(e) => setOrder(Number(e.target.value))}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">
                    {editCategoryId ? "Save Changes" : "Create Node"}
                  </Button>
                  {editCategoryId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
