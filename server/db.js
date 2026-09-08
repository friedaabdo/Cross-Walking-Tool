import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Add it to your .env file.");
}

export const pool = mysql.createPool(process.env.DATABASE_URL);

export async function query(text, params = []) {
  const [result] = await pool.execute(text, params);

  if (Array.isArray(result)) {
    return { rows: result, rowCount: result.length };
  }

  return {
    rows: [],
    rowCount: result.affectedRows ?? 0,
    insertId: result.insertId,
  };
}
