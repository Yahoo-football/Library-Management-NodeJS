import UserModel from '../models/user.model.js';

type ServiceError = Error & {
    statusCode?: number;
};

class UserService {
    static validateId(idParam: string | string[] | undefined): number {
        if (Array.isArray(idParam) || idParam === undefined) {
            const error: ServiceError = new Error('Invalid user id');
            error.statusCode = 400;
            throw error;
        }

        const id = Number(idParam);

        if (!Number.isInteger(id) || id <= 0) {
            const error: ServiceError = new Error('Invalid user id');
            error.statusCode = 400;
            throw error;
        }

        return id;
    }

    static validateUserData(name: unknown, email: unknown): { name: string; email: string } {
        if (typeof name !== 'string' || name.trim() === '') {
            const error: ServiceError = new Error('Name is required');
            error.statusCode = 400;
            throw error;
        }

        if (typeof email !== 'string' || email.trim() === '') {
            const error: ServiceError = new Error('Email is required');
            error.statusCode = 400;
            throw error;
        }

        return {
            name: name.trim(),
            email: email.trim()
        };
    }

    static async getAll() {
        try {
            return await UserModel.index();
        } catch {
            const error: ServiceError = new Error('Failed to fetch users');
            error.statusCode = 500;
            throw error;
        }
    }

    static async findById(idParam: string | string[] | undefined) {
        try {
            const id = this.validateId(idParam);
            const user = await UserModel.findById(id);

            if (!user) {
                const error: ServiceError = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            return user;
        } catch (error) {
            if (error instanceof Error && (error.message === 'Invalid user id' || error.message === 'User not found')) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to fetch user');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async create(data: { name?: unknown; email?: unknown }) {
        try {
            const validatedData = this.validateUserData(data.name, data.email);
            return await UserModel.create(validatedData.name, validatedData.email);
        } catch (error: unknown) {
            if (error instanceof Error && (error.message === 'Name is required' || error.message === 'Email is required')) {
                throw error;
            }

            if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
                const serviceError: ServiceError = new Error('Email already exists');
                serviceError.statusCode = 409;
                throw serviceError;
            }

            const serviceError: ServiceError = new Error('Failed to create user');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async update(idParam: string | string[] | undefined, data: { name?: unknown; email?: unknown }) {
        try {
            const id = this.validateId(idParam);
            const validatedData = this.validateUserData(data.name, data.email);
            const user = await UserModel.update(id, validatedData.name, validatedData.email);

            if (!user) {
                const error: ServiceError = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            return user;
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                (error.message === 'Invalid user id' || error.message === 'Name is required' || error.message === 'Email is required' || error.message === 'User not found')
            ) {
                throw error;
            }

            if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
                const serviceError: ServiceError = new Error('Email already exists');
                serviceError.statusCode = 409;
                throw serviceError;
            }

            const serviceError: ServiceError = new Error('Failed to update user');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }

    static async delete(idParam: string | string[] | undefined) {
        try {
            const id = this.validateId(idParam);
            const deleted = await UserModel.delete(id);

            if (!deleted) {
                const error: ServiceError = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }
        } catch (error) {
            if (error instanceof Error && (error.message === 'Invalid user id' || error.message === 'User not found')) {
                throw error;
            }

            const serviceError: ServiceError = new Error('Failed to delete user');
            serviceError.statusCode = 500;
            throw serviceError;
        }
    }
}

export default UserService;
