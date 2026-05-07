import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db.js';

export type User = {
    id: number;
    name: string;
    email: string;
    created_at: Date;
};

class UserModel {
    static async index(): Promise<User[]> {
        const [rows] = await pool.query<(User & RowDataPacket)[]>(
            'SELECT id, name, email, created_at FROM users ORDER BY id DESC'
        );

        return rows;
    }

    static async findById(id: number): Promise<User | null> {
        const [rows] = await pool.query<(User & RowDataPacket)[]>(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [id]
        );

        return rows[0] ?? null;
    }

    static async create(name: string, email: string): Promise<User> {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name, email]
        );

        const user = await this.findById(result.insertId);

        if (!user) {
            throw new Error('Created user could not be retrieved');
        }

        return user;
    }

    static async update(id: number, name: string, email: string): Promise<User | null> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, id]
        );

        if (result.affectedRows === 0) {
            return null;
        }

        return this.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }
}

export default UserModel;
