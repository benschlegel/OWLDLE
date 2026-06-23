import type { DbFeedback } from '@/types/database';
import { feedbackCollection } from './client';

/**
 * Add website feedback to db
 */
export async function addFeedback(feedback: DbFeedback) {
	return feedbackCollection.insertOne(feedback);
}
