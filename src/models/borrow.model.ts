import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db.js';

export type BorrowStatus = 'borrowed' | 'returned';

export type Borrow = {
    id: number;
    user_id: number;
    book_id: number;
    borrow_date: string;
    return_date: string | null;
    status: BorrowStatus;
    created_at: Date;
};

class BorrowModel {
    static async index(): Promise<Borrow[]> {
        const [rows] = await pool.query<(Borrow & RowDataPacket)[]>(
            'SELECT id, user_id, book_id, borrow_date, return_date, status, created_at FROM borrows ORDER BY id DESC'
        );

        return rows;
    }

    static async findById(id: number): Promise<Borrow | null> {
        const [rows] = await pool.query<(Borrow & RowDataPacket)[]>(
            'SELECT id, user_id, book_id, borrow_date, return_date, status, created_at FROM borrows WHERE id = ?',
            [id]
        );

        return rows[0] ?? null;
    }

    static async create(
        userId: number,
        bookId: number,
        borrowDate: string | null,
        returnDate: string | null,
        status: BorrowStatus
    ): Promise<Borrow> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO borrows (user_id, book_id, borrow_date, return_date, status)
             VALUES (?, ?, COALESCE(?, CURRENT_DATE), ?, ?)`,
            [userId, bookId, borrowDate, returnDate, status]
        );

        const borrow = await this.findById(result.insertId);

        if (!borrow) {
            throw new Error('Created borrow could not be retrieved');
        }

        return borrow;
    }

    static async update(
        id: number,
        userId: number,
        bookId: number,
        borrowDate: string | null,
        returnDate: string | null,
        status: BorrowStatus
    ): Promise<Borrow | null> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE borrows
             SET user_id = ?, book_id = ?, borrow_date = COALESCE(?, borrow_date), return_date = ?, status = ?
             WHERE id = ?`,
            [userId, bookId, borrowDate, returnDate, status, id]
        );

        if (result.affectedRows === 0) {
            return null;
        }

        return this.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM borrows WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }
}

export default BorrowModel;
