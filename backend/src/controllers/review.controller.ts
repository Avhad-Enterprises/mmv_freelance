import { NextFunction, Request, Response } from "express";
import { ReviewDto } from "../dtos/review.dto";
import ReviewsService from "../services/review.services";
import HttpException from "../exceptions/HttpException";

class ReviewsController {
  public reviewsService = new ReviewsService();

    // POST /api/reviews/create
public createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviewData: ReviewDto = req.body; // DTO already validated and parsed

    const createdReview = await this.reviewsService.createReview(reviewData);

    res.status(201).json({
      data: createdReview,
      message: "Review submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

  // POST /api/reviews/freelancer
  public getReviewsByFreelancer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { user_id } = req.body;
    if (!user_id || isNaN(parseInt(user_id))) {
      throw new HttpException(400, "Invalid or missing user_id");
    }

    const reviews = await this.reviewsService.getReviewsByFreelancer(parseInt(user_id));
    res.status(200).json({
      data: reviews,
      message: `Fetched reviews for freelancer ${user_id}`,
    });
  };

  // POST /api/reviews/client
  public getReviewsByClient = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { client_id } = req.body;
    if (!client_id || isNaN(parseInt(client_id))) {
      throw new HttpException(400, "Invalid or missing client_id");
    }

    const reviews = await this.reviewsService.getReviewsByClient(parseInt(client_id));
    res.status(200).json({
      data: reviews,
      message: `Fetched reviews by client ${client_id}`,
    });
  };

  // POST /api/reviews/delete
  public deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { review_id } = req.body;
    if (!review_id || isNaN(parseInt(review_id))) {
      throw new HttpException(400, "Invalid or missing review_id");
    }

    await this.reviewsService.deleteReview(parseInt(review_id));
    res.status(200).json({
      message: "Review deleted successfully",
    });
  };
}

export default ReviewsController;
