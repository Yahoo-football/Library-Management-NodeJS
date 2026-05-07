import BookModel from '../models/book.model.js';
import BorrowModel, { BorrowStatus } from '../models/borrow.model.js';
import UserModel from '../models/user.model.js';

type ServiceError = Error & {
    statusCode?: number;
};

class BorrowService {
    static validateId(idParam: string | string[] | undefined): number {
        if (Array.isArray(idParam) || idParam === undefined) {
            const error: ServiceError = new Error('Invalid borrow id');
            error.statusCode = 400;
            throw error;
        }

        const id = Number(idParam);

        if (!Number.isInteger(id) || id <= 0) {
            const error: ServiceError = new Error('Invalid borrow id');
            error.statusCode = 400;
            throw error;
        }

        return id;
    }

    static validateDate(dateValue: unknown, fieldName: string): string | null {
        if (dateValue === undefined || dateValue === null || dateValue === '') {
            return null;
        }

        if (typeof dateValue !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            const error: ServiceError = new Error(`${fieldName} must be in YYYY-MM-DD format`);
            error.statusCode = 400;
            throw error;
        }

        return dateValue;
    }

    static validateBorrowData(
        userId: unknown,
        bookId: unknown,
        borrowDate: unknown,
        returnDate: unknown,
        status: unknown
    ): { userId: number; bookId: number; borrowDate: string | null; returnDate: string | null; status: BorrowStatus } {
        const parsedUserId = Number(userId);
        const parsedBookId = Number(bookId);

        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            const error: ServiceError = new Error('Valid user_id is required');
            error.statusCode = 400;
            throw error;
        }

        if (!Number.isInteger(parsedBookId) || parsedBookId <= 0) {
            const error: ServiceError = new Error('Valid book_id is required');
            error.statusCode = 400;
            throw error;
        }

        if (status !== 'borrowed' && status !== 'returned') {
            const error: ServiceError = new Error('Status must be borrowed or returned');
            error.statusCode = 400;
            throw error;
        }

        return {
            userId: parsedUserId,
            bookId: parsedBookId,
            borrowDate: this.validateDate(borrowDate, 'borrow_date'),
            returnDate: this.validateDate(returnDate, 'return_date'),
            status
        };
    }

    static async ensureRelatedRecordsExist(userId: number, bookId: number): Promise<void> {
        const [user, book] = await Promise.all([
            UserModel.findById(userId),
            BookModel.findById(bookId)
        ]);

        if (!user) {
            const error: ServiceError = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (!book) {
            const error: ServiceError = new Error('Book not found');
            error.statusCode = 404;
            throw error;
        }
    }

    static async getAll() {
        try {
            return await BorrowModel.index();
        } catch {
            const error: ServiceError = new Error('Failed to fetch borrows');
            error.statusCode = 500;
            throw error;
        }
    }

    static async findById(idParam: string | string[] | undefined) {
        try {
            const id = this.validateId(idParam);
            const borrow = await BorrowModel.findById(id);

            if (!borrow) {
                const error: ServiceError = new Error('Borrow not found');
                error.statusCode = 404;
                throw error;
            }

            return borrow;
        } catch (error) {
            if (error instanceof Error && (error.message === 'Invalid borrow id' || error.message === 'Borrow not found')) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to fetch borrow');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async create(data: {
        user_id?: unknown;
        book_id?: unknown;
        borrow_date?: unknown;
        return_date?: unknown;
        status?: unknown;
    }) {
        try {
            const validatedData = this.validateBorrowData(
                data.user_id,
                data.book_id,
                data.borrow_date,
                data.return_date,
                data.status
            );

            await this.ensureRelatedRecordsExist(validatedData.userId, validatedData.bookId);

            return await BorrowModel.create(
                validatedData.userId,
                validatedData.bookId,
                validatedData.borrowDate,
                validatedData.returnDate,
                validatedData.status
            );
        } catch (error) {
            if (
                error instanceof Error &&
                (
                    error.message === 'Valid user_id is required' ||
                    error.message === 'Valid book_id is required' ||
                    error.message === 'Status must be borrowed or returned' ||
                    error.message === 'borrow_date must be in YYYY-MM-DD format' ||
                    error.message === 'return_date must be in YYYY-MM-DD format' ||
                    error.message === 'User not found' ||
                    error.message === 'Book not found'
                )
            ) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to create borrow');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async update(
        idParam: string | string[] | undefined,
        data: {
            user_id?: unknown;
            book_id?: unknown;
            borrow_date?: unknown;
            return_date?: unknown;
            status?: unknown;
        }
    ) {
        try {
            const id = this.validateId(idParam);
            const validatedData = this.validateBorrowData(
                data.user_id,
                data.book_id,
                data.borrow_date,
                data.return_date,
                data.status
            );

            await this.ensureRelatedRecordsExist(validatedData.userId, validatedData.bookId);

            const borrow = await BorrowModel.update(
                id,
                validatedData.userId,
                validatedData.bookId,
                validatedData.borrowDate,
                validatedData.returnDate,
                validatedData.status
            );

            if (!borrow) {
                const error: ServiceError = new Error('Borrow not found');
                error.statusCode = 404;
                throw error;
            }

            return borrow;
        } catch (error) {
            if (
                error instanceof Error &&
                (
                    error.message === 'Invalid borrow id' ||
                    error.message === 'Valid user_id is required' ||
                    error.message === 'Valid book_id is required' ||
                    error.message === 'Status must be borrowed or returned' ||
                    error.message === 'borrow_date must be in YYYY-MM-DD format' ||
                    error.message === 'return_date must be in YYYY-MM-DD format' ||
                    error.message === 'User not found' ||
                    error.message === 'Book not found' ||
                    error.message === 'Borrow not found'
                )
            ) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to update borrow');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async delete(idParam: string | string[] | undefined) {
        try {
            const id = this.validateId(idParam);
            const deleted = await BorrowModel.delete(id);

            if (!deleted) {
                const error: ServiceError = new Error('Borrow not found');
                error.statusCode = 404;
                throw error;
            }
        } catch (error) {
            if (error instanceof Error && (error.message === 'Invalid borrow id' || error.message === 'Borrow not found')) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to delete borrow');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }
}

export default BorrowService;
