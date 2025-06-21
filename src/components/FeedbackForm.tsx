import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating",
        variant: "destructive",
      });
      return;
    }

    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide your feedback",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setRating(0);
      setFeedback("");

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>We’d love to hear your thoughts about ByteMe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    (hoveredStar >= star || rating >= star)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your feedback *</label>
          <Textarea
            placeholder="Tell us what you think about the app..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || !feedback.trim()}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
