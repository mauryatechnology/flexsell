"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/toastStore";
import { MessageSquare, Star, Check, X, Trash2, ExternalLink, MessageCircle } from "lucide-react";
import { reviewService } from "@/services/reviewService";

export default function AdminReviewsPage() {
  const { addToast } = useToastStore();
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"all" | "pending" | "approved" | "rejected">("all");
  
  // Admin Response Modal State
  const [replyReviewId, setReplyReviewId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [isSubmittingReply, setIsSubmittingReply] = React.useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await reviewService.getAllReviewsAdmin();
      setReviews(data);
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to load reviews for moderation", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      await reviewService.moderateReviewAdmin(id, newStatus);
      addToast(`Review status updated to ${newStatus}!`, "success");
      fetchReviews();
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to update review status", "error");
    }
  };

  const handleOpenReplyModal = (review: any) => {
    setReplyReviewId(review._id);
    setReplyText(review.adminResponse || "");
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewId) return;

    setIsSubmittingReply(true);
    try {
      await reviewService.moderateReviewAdmin(replyReviewId, undefined as any, replyText);
      addToast("Admin response saved successfully!", "success");
      setReplyReviewId(null);
      setReplyText("");
      fetchReviews();
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to save response", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return;
    try {
      await reviewService.deleteReviewAdmin(id);
      addToast("Review deleted permanently", "success");
      fetchReviews();
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to delete review", "error");
    }
  };

  const filteredReviews = React.useMemo(() => {
    if (activeTab === "all") return reviews;
    return reviews.filter(r => r.status === activeTab);
  }, [reviews, activeTab]);

  return (
    <div className="space-y-6 container mx-auto px-4 py-8 text-foreground max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderate Reviews</h1>
        <p className="text-muted-foreground mt-1">Approve B2B customer reviews and post platform responses.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-bold gap-4">
        {["all", "pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 capitalize transition-all border-b-2 -mb-[2px] ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab} ({reviews.filter(r => tab === "all" || r.status === tab).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="pt-10 pb-10 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-bold">No reviews to moderate</h3>
            <p className="text-muted-foreground text-sm mt-1">
              There are no reviews matching the current tab criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <Card key={rev._id} className={`border ${rev.status === "pending" ? "border-yellow-500/30 bg-yellow-500/[0.01]" : "border-border shadow-sm"}`}>
              <CardContent className="pt-6 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground text-sm">{rev.customerName}</span>
                      <span className="text-muted-foreground font-semibold">•</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span>Product:</span>
                      <span className="text-primary flex items-center gap-1">
                        {rev.productTitle}
                        {rev.productSlug && (
                          <Link href={`/products/${rev.productSlug}`} target="_blank">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={`${
                            s <= rev.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rev.status !== "approved" && (
                      <Button size="sm" className="h-8 font-bold flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(rev._id, "approved")}>
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                    )}
                    {rev.status !== "rejected" && (
                      <Button size="sm" className="h-8 font-bold flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => handleUpdateStatus(rev._id, "rejected")}>
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 font-bold flex items-center gap-1" onClick={() => handleOpenReplyModal(rev)}>
                      <MessageCircle className="h-3.5 w-3.5" /> {rev.adminResponse ? "Edit Reply" : "Reply"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 font-bold text-destructive hover:bg-destructive/5 hover:text-destructive flex items-center gap-1" onClick={() => handleDeleteReview(rev._id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">{rev.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>

                {rev.adminResponse && (
                  <div className="bg-secondary/35 p-3 rounded-lg border border-l-4 border-l-primary space-y-1">
                    <span className="font-bold text-primary flex items-center gap-1">
                      Platform Response:
                    </span>
                    <p className="text-muted-foreground italic">{rev.adminResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyReviewId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl max-w-lg w-full shadow-2xl p-6 text-foreground space-y-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Submit Administrator Response</h3>
              <p className="text-muted-foreground text-xs mt-0.5">This reply will display directly below the buyer's review.</p>
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Admin Response Text *</label>
                <textarea
                  placeholder="Type response here (e.g. Thank you for your feedback. We have verified this with our manufacturer...)"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setReplyReviewId(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingReply}>
                  {isSubmittingReply ? "Saving..." : "Save Reply"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
