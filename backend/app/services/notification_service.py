"""
Notification Service

Handles notifications to users and admins.
Currently implements basic logging, can be extended with a Notification table later.
"""

from sqlalchemy.orm import Session
from app.sql_models import User
import logging

logger = logging.getLogger(__name__)


def notify_admins_of_failure(db: Session, error_message: str) -> None:
    """
    Notify all admin users about a scraper failure.

    Currently logs the error. In a future implementation, this should:
    1. Create Notification records in the database
    2. Send emails or push notifications
    3. Display in the admin dashboard

    Args:
        db: Database session
        error_message: Error message to send to admins
    """
    try:
        # Get all admin users
        admins = db.query(User).filter(User.role == "admin").all()
        admin_count = len(admins)

        if admin_count == 0:
            logger.warning("No admin users found to notify about scraper failure")
            return

        # Log the error notification
        admin_emails = [admin.email for admin in admins]
        logger.error(
            f"SCRAPER FAILURE - Notifying {admin_count} admins: {', '.join(admin_emails)}\n"
            f"Error: {error_message}"
        )

        # TODO: In future implementation:
        # for admin in admins:
        #     notification = Notification(
        #         id=f"notif-{uuid.uuid4()}",
        #         userId=admin.id,
        #         type="scraper_failure",
        #         message=error_message,
        #         read=False,
        #         createdAt=datetime.utcnow()
        #     )
        #     db.add(notification)
        # db.commit()

    except Exception as e:
        logger.error(f"Failed to notify admins: {str(e)}")


def notify_user_of_points(
    db: Session, user_id: str, prediction_id: str, points: int, match_info: str
) -> None:
    """
    Notify a user that they received points for a prediction.

    Currently logs the notification. In a future implementation, this should:
    1. Create a Notification record
    2. Mark the prediction as notified
    3. Display in the user's notification center

    Args:
        db: Database session
        user_id: User ID to notify
        prediction_id: Prediction ID
        points: Points earned
        match_info: Human-readable match info (e.g., "Argentina 2-1 Brazil")
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"User {user_id} not found for points notification")
            return

        logger.info(
            f"POINTS EARNED - User: {user.name} ({user.email})\n"
            f"Match: {match_info}\n"
            f"Prediction: {prediction_id}\n"
            f"Points: {points}"
        )

        # TODO: Create Notification record in database

    except Exception as e:
        logger.error(f"Failed to notify user {user_id} of points: {str(e)}")


def get_unnotified_predictions_count(db: Session, user_id: str) -> int:
    """
    Get count of predictions with points that user hasn't been notified about.

    This can be used for the notification badge counter in the frontend.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        Count of unnotified predictions with points
    """
    from app.sql_models import Prediction

    try:
        count = (
            db.query(Prediction)
            .filter(
                Prediction.userId == user_id,
                Prediction.points.isnot(None),
                Prediction.notified == False,
            )
            .count()
        )
        return count
    except Exception as e:
        logger.error(
            f"Failed to get unnotified predictions count for user {user_id}: {str(e)}"
        )
        return 0
