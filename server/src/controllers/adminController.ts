import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// 1. ดึงข้อมูลผู้ใช้ทั้งหมด (GET /api/admin/users)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.is_admin, u.created_at,
             p.display_name, p.age, p.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. แบนผู้ใช้ (POST /api/admin/ban/:userId) - ใช้วิธีลบไอดีทิ้งถาวร
export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { userId } = req.params;

    if (isNaN(Number(userId))) return res.status(400).json({ message: 'Invalid user ID' });

    // ป้องกันแอดมินเผลอกดแบนตัวเอง
    if (Number(userId) === adminId) {
        return res.status(400).json({ message: 'Cannot ban yourself' });
    }

    // ลบ User (ระบบจะ CASCADE ไปลบโปรไฟล์และแชททิ้งทั้งหมดอัตโนมัติ)
    const deleteResult = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

    if (deleteResult.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    // บันทึกประวัติว่าแอดมินคนไหนเป็นคนกดแบน
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_id) VALUES ($1, $2, $3)',
      [adminId, 'banned_user', userId]
    );

    res.json({ message: 'User banned and permanently removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. เพิ่มรายชื่อเกมใหม่ (POST /api/admin/games)
export const addGame = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { game_name, game_icon_url } = req.body;

    if (!game_name) return res.status(400).json({ message: 'Game name is required' });

    // บันทึกเกมใหม่ลง Database
    const newGame = await pool.query(
      'INSERT INTO games (game_name, game_icon_url) VALUES ($1, $2) RETURNING *',
      [game_name, game_icon_url || '']
    );

    // บันทึกประวัติของแอดมิน
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_id) VALUES ($1, $2, $3)',
      [adminId, 'added_new_game', newGame.rows[0].id]
    );

    res.status(201).json({ message: 'Game added successfully', game: newGame.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};