import { Router } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import ReviewsController from '../controllers/review.controller';
import { ReviewDto } from '../dtos/review.dto';
import Route from '../interfaces/routes.interface';

class ReviewRoute implements Route {
  public path = '/reviews';
  public router = Router();
  public reviewsController = new ReviewsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Submit a review (POST)
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(ReviewDto, 'body', false, ['create']),
      this.reviewsController.createReview
    );

    // Get reviews received by a freelancer (POST)
    this.router.post(
      `${this.path}/freelancer`,
      this.reviewsController.getReviewsByFreelancer
    );

    // Get reviews written by a client (POST)
    this.router.post(
      `${this.path}/client`,
      this.reviewsController.getReviewsByClient
    );

    // Soft delete a review (DELETE)
    this.router.delete(
      `${this.path}/delete`,
      this.reviewsController.deleteReview
    );
  }
}

export default ReviewRoute;
