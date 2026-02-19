import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// 1. ดึงรายชื่อเกมทั้งหมดในระบบ (เพื่อให้หน้า Register ดึงไปโชว์)
export const getAllGames = async (req: any, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM games ORDER BY game_name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. ดึงข้อมูล Profile ของฉัน
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const userResult = await pool.query(`
      SELECT u.id as user_id, u.name, u.email, u.is_admin,
             p.display_name, p.bio, p.country, p.age, p.profile_images
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const gamesResult = await pool.query(`
      SELECT g.id as game_id, g.game_name, g.game_icon_url
      FROM user_game_interests ugi
      JOIN games g ON ugi.game_id = g.id
      WHERE ugi.user_id = $1
    `, [userId]);

    res.json({
      ...userResult.rows[0],
      games: gamesResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. อัปเดตข้อมูล Profile (รองรับ Array รูปภาพ)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { display_name, bio, country, age, profile_images } = req.body;

    await pool.query(`
      INSERT INTO profiles (user_id, display_name, bio, country, age, profile_images)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        display_name = $2, 
        bio = $3, 
        country = $4, 
        age = $5, 
        profile_images = $6,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, display_name, bio, country, age, profile_images]);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. เพิ่มเกมที่สนใจ
export const updateMyGames = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { gameId } = req.body;

    const gameCheck = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if(gameCheck.rows.length === 0) return res.status(400).json({ message: 'Game not found in system' });

    await pool.query(`
      INSERT INTO user_game_interests (user_id, game_id)
      VALUES ($1, $2)
    `, [userId, gameId]);

    res.json({ message: 'Game interest added successfully' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Game already added' });
    console.error(err);
    res.status(500).json({ message: 'Error adding game' });
  }
};