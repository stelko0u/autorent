import { queryOne, execute } from '@/lib/db';
import { PasswordResetToken } from '@/types/database';

export class PasswordResetTokenRepository {
  static async create(
    data: Omit<PasswordResetToken, 'createdAt'>,
  ): Promise<PasswordResetToken> {
    const result = await queryOne<PasswordResetToken>(
      `INSERT INTO "PasswordResetToken" (id, "userId", email, token, "expiresAt") 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [data.id, data.userId, data.email, data.token, data.expiresAt],
    );
    return result!;
  }

  static async findByToken(token: string): Promise<PasswordResetToken | null> {
    return queryOne<PasswordResetToken>(
      'SELECT * FROM "PasswordResetToken" WHERE token = $1',
      [token],
    );
  }

  static async deleteByEmail(email: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM "PasswordResetToken" WHERE email = $1',
      [email],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async deleteByUserId(userId: number): Promise<boolean> {
    const result = await execute(
      'DELETE FROM "PasswordResetToken" WHERE "userId" = $1',
      [userId],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async deleteByToken(token: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM "PasswordResetToken" WHERE token = $1',
      [token],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async deleteExpired(): Promise<boolean> {
    const result = await execute(
      'DELETE FROM "PasswordResetToken" WHERE "expiresAt" < NOW()',
      [],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async findByEmailAndToken(
    email: string,
    token: string,
  ): Promise<PasswordResetToken | null> {
    return queryOne<PasswordResetToken>(
      `SELECT * 
       FROM "PasswordResetToken" 
       WHERE "userId" = (
           SELECT id
           FROM "User"
           WHERE email = $1
           LIMIT 1
         )
         AND token = $2
         AND "expiresAt" >= NOW()
       LIMIT 1`,
      [email, token],
    );
  }
}
