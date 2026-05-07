import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db.js';

export abstract class Book {
    abstract id: number;
    abstract title: string;
    abstract author: string;
    abstract quantity: number;
    abstract created_at: Date;
}

class BookModel {
    static async index(): Promise<Book[]> {
        const [rows] = await pool.query<(Book & RowDataPacket)[]>(
            'SELECT id, title, author, quantity, created_at FROM books ORDER BY id DESC'
        );

        return rows;
    }

    static async findById(id: number): Promise<Book | null> {
        const [rows] = await pool.query<(Book & RowDataPacket)[]>(
            'SELECT id, title, author, quantity, created_at FROM books WHERE id = ?',
            [id]
        );

        return rows[0] ?? null;
    }

    static async create(title: string, author: string, quantity: number): Promise<Book> {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)',
            [title, author, quantity]
        );

        const book = await this.findById(result.insertId);

        if (!book) {
            throw new Error('Created book could not be retrieved');
        }

        return book;
    }

    static async update(id: number, title: string, author: string, quantity: number): Promise<Book | null> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE books SET title = ?, author = ?, quantity = ? WHERE id = ?',
            [title, author, quantity, id]
        );

        if (result.affectedRows === 0) {
            return null;
        }

        return this.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM books WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }
}

export default BookModel;
