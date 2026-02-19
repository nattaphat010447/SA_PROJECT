import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// 1. ดึงข้อมูล Profile ของฉัน
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Join ตาราง users + profiles
    const userResult = await pool.query(`
      SELECT u.id as user_id, u.name, u.email, u.is_admin,
             p.display_name, p.bio, p.country, p.age, p.profile_image_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    // ดึงเกมที่ User เล่นจาก user_game_interests
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

// 2. อัปเดตข้อมูล Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { display_name, bio, country, age, profile_image_url } = req.body;

    // Upsert ตาราง Profiles 
    await pool.query(`
      INSERT INTO profiles (user_id, display_name, bio, country, age, profile_image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        display_name = $2, 
        bio = $3, 
        country = $4, 
        age = $5, 
        profile_image_url = $6,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, display_name, bio, country, age, profile_image_url]);

    res.json({ message: 'Profile updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. เพิ่มเกมที่สนใจ (User Game Interests)
export const updateMyGames = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { gameId } = req.body;

    // เช็คก่อนว่ามีเกมนี้ในระบบไหม
    const gameCheck = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if(gameCheck.rows.length === 0) return res.status(400).json({ message: 'Game not found in system' });

    // เพิ่มข้อมูลลง user_game_interests
    await pool.query(`
      INSERT INTO user_game_interests (user_id, game_id)
      VALUES ($1, $2)
    `, [userId, gameId]);

    res.json({ message: 'Game interest added successfully' });

  } catch (err) {
    // 23505 คือ Error Code ของ Unique Violation (ป้องกันเซฟซ้ำ)
    if (err.code === '23505') return res.status(400).json({ message: 'Game already added' });
    console.error(err);
    res.status(500).json({ message: 'Error adding game' });
  }
};