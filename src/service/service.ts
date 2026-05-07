import BookModel from '../models/book.model.js';

type ServiceError = Error & {
    statusCode?: number;
};

class BookService {
    static validateId(idParam: string | string[] | undefined): number {
        if (Array.isArray(idParam) || idParam === undefined) {
            const error: ServiceError = new Error('Invalid book id');
            error.statusCode = 400;
            throw error;
        }

        const id = Number(idParam);

        if (!Number.isInteger(id) || id <= 0) {
            const error: ServiceError = new Error('Invalid book id');
            error.statusCode = 400;
            throw error;
        }

        return id;
    }

    static validateBookData(title: unknown, author: unknown, quantity: unknown): { title: string; author: string; quantity: number } {
        if (typeof title !== 'string' || title.trim() === '') {
            const error: ServiceError = new Error('Title is required');
            error.statusCode = 400;
            throw error;
        }

        if (typeof author !== 'string' || author.trim() === '') {
            const error: ServiceError = new Error('Author is required');
            error.statusCode = 400;
            throw error;
        }

        const parsedQuantity = Number(quantity);

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
            const error: ServiceError = new Error('Quantity must be a non-negative integer');
            error.statusCode = 400;
            throw error;
        }

        return {
            title: title.trim(),
            author: author.trim(),
            quantity: parsedQuantity
        };
    }

    static async getAll() {
        try {
            return await BookModel.index();
        } catch {
            const error: ServiceError = new Error('Failed to fetch books');
            error.statusCode = 500;
            throw error;
        }
    }

    static async findById(idParam: string | string[] | undefined) {
        try {
            const id = this.validateId(idParam);
            const book = await BookModel.findById(id);

            if (!book) {
                const error: ServiceError = new Error('Book not found');
                error.statusCode = 404;
                throw error;
            }

            return book;
        } catch (error) {
            if (
                error instanceof Error &&
                (error.message === 'Invalid book id' || error.message === 'Book not found')
            ) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to fetch book');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async create(data: { title?: unknown; author?: unknown; quantity?: unknown }) {
        try {
            const validatedData = this.validateBookData(data.title, data.author, data.quantity);
            return await BookModel.create(validatedData.title, validatedData.author, validatedData.quantity);
        } catch (error) {
            if (
                error instanceof Error &&
                (
                    error.message === 'Title is required' ||
                    error.message === 'Author is required' ||
                    error.message === 'Quantity must be a non-negative integer'
                )
            ) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to create book');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async update(idParam: string | string[] | undefined, data: { title?: unknown; author?: unknown; quantity?: unknown }) {
        try {
            const id = this.validateId(idParam);
            const validatedData = this.validateBookData(data.title, data.author, data.quantity);
            const book = await BookModel.update(id, validatedData.title, validatedData.author, validatedData.quantity);

            if (!book) {
                const error: ServiceError = new Error('Book not found');
                error.statusCode = 404;
                throw error;
            }

            return book;
        } catch (error) {
            if (
                error instanceof Error &&
                (
                    error.message === 'Invalid book id' ||
                    error.message === 'Title is required' ||
                    error.message === 'Author is required' ||
                    error.message === 'Quantity must be a non-negative integer' ||
                    error.message === 'Book not found'
                )
            ) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to update book');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async delete(idParam: string | string[] | undefined) {
        try {
            const id = this.validateId(idParam);
            const deleted = await BookModel.delete(id);

            if (!deleted) {
                const error: ServiceError = new Error('Book not found');
                error.statusCode = 404;
                throw error;
            }
        } catch (error) {
            if (
                error instanceof Error &&
                (error.message === 'Invalid book id' || error.message === 'Book not found')
            ) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to delete book');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }
}

export default BookService;
