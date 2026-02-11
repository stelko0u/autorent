import { NextResponse } from 'next/server';
import jwt, {
  JwtPayload,
  JsonWebTokenError,
  TokenExpiredError,
} from 'jsonwebtoken';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'token';

// Настройка на връзката с базата данни
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function getTokenFromRequest(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.substring(7).trim();
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(
    new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[2]) : null;
}

async function requireAdmin(req: Request) {
  if (!JWT_SECRET)
    return {
      ok: false,
      resp: NextResponse.json(
        { error: 'server_misconfigured' },
        { status: 500 },
      ),
    };
  const token = getTokenFromRequest(req);
  if (!token)
    return {
      ok: false,
      resp: NextResponse.json({ error: 'no_token' }, { status: 401 }),
    };
  try {
    const payload = jwt.verify(token, JWT_SECRET) as
      | JwtPayload
      | Record<string, any>;
    const userId = Number((payload as any).userId ?? payload.sub ?? null);
    if (!userId || Number.isNaN(userId))
      return {
        ok: false,
        resp: NextResponse.json({ error: 'invalid_token' }, { status: 401 }),
      };

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, role FROM users WHERE id = $1',
        [userId],
      );
      const user = result.rows[0];
      if (!user)
        return {
          ok: false,
          resp: NextResponse.json({ error: 'user_not_found' }, { status: 404 }),
        };
      if (user.role !== 'ADMIN')
        return {
          ok: false,
          resp: NextResponse.json({ error: 'forbidden' }, { status: 403 }),
        };
      return { ok: true, user };
    } finally {
      client.release();
    }
  } catch (err) {
    if (err instanceof TokenExpiredError)
      return {
        ok: false,
        resp: NextResponse.json({ error: 'token_expired' }, { status: 401 }),
      };
    if (err instanceof JsonWebTokenError)
      return {
        ok: false,
        resp: NextResponse.json({ error: 'invalid_token' }, { status: 401 }),
      };
    console.error('requireAdmin error:', err);
    return {
      ok: false,
      resp: NextResponse.json({ error: 'internal_error' }, { status: 500 }),
    };
  }
}

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, name, email, maintenance_percent AS "maintenancePercent", owner_id AS "ownerId", created_at AS "createdAt" FROM companies ORDER BY id DESC',
    );
    return NextResponse.json({ ok: true, companies: result.rows });
  } catch (err) {
    console.error('GET /api/admin/companies error:', err);
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PATCH(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  try {
    const body = await req.json();
    const { id, maintenancePercent, name, email } = body;
    if (!id)
      return NextResponse.json(
        { ok: false, error: 'id_required' },
        { status: 400 },
      );

    const updates: string[] = [];
    const values: any[] = [id];
    let index = 2;

    if (maintenancePercent !== undefined) {
      const m = Number(maintenancePercent);
      if (!Number.isFinite(m) || m < 0 || m > 100)
        return NextResponse.json(
          { ok: false, error: 'invalid_maintenance' },
          { status: 400 },
        );
      updates.push(`maintenance_percent = $${index++}`);
      values.push(m);
    }
    if (name !== undefined) {
      updates.push(`name = $${index++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${index++}`);
      values.push(email);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE companies SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
        values,
      );
      return NextResponse.json({ ok: true, company: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('PATCH /api/admin/companies error:', err);
    return NextResponse.json(
      { ok: false, error: 'update_error' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  try {
    const body = await req.json();
    const { id } = body;
    if (!id)
      return NextResponse.json(
        { ok: false, error: 'id_required' },
        { status: 400 },
      );

    const client = await pool.connect();
    try {
      const companyResult = await client.query(
        'SELECT owner_id AS "ownerId" FROM companies WHERE id = $1',
        [id],
      );
      const company = companyResult.rows[0];
      if (!company)
        return NextResponse.json(
          { ok: false, error: 'not_found' },
          { status: 404 },
        );

      await client.query('DELETE FROM companies WHERE id = $1', [id]);
      try {
        await client.query('DELETE FROM users WHERE id = $1', [
          company.ownerId,
        ]);
      } catch (e) {
        console.warn('Failed deleting owner user:', e);
      }

      return NextResponse.json({ ok: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('DELETE /api/admin/companies error:', err);
    return NextResponse.json(
      { ok: false, error: 'delete_error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  try {
    const body = await req.json();
    const { name, email, maintenancePercent = 0, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: 'name_email_password_required' },
        { status: 400 },
      );
    }

    const m = Number(maintenancePercent);
    if (!Number.isFinite(m) || m < 0 || m > 100) {
      return NextResponse.json(
        { ok: false, error: 'invalid_maintenance' },
        { status: 400 },
      );
    }

    const client = await pool.connect();
    try {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email],
      );
      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { ok: false, error: 'user_email_taken' },
          { status: 409 },
        );
      }

      const existingCompany = await client.query(
        'SELECT id FROM companies WHERE email = $1',
        [email],
      );
      if (existingCompany.rows.length > 0) {
        return NextResponse.json(
          { ok: false, error: 'company_email_taken' },
          { status: 409 },
        );
      }

      const hashed = await bcrypt.hash(password, 10);

      await client.query('BEGIN');
      const userResult = await client.query(
        'INSERT INTO users (email, password, name, role, email_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [email, hashed, name, 'COMPANY', true, new Date()],
      );
      const userId = userResult.rows[0].id;

      const companyResult = await client.query(
        'INSERT INTO companies (name, email, maintenance_percent, owner_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, m, userId],
      );
      const companyId = companyResult.rows[0].id;

      await client.query('UPDATE users SET company_id = $1 WHERE id = $2', [
        companyId,
        userId,
      ]);
      await client.query('COMMIT');

      return NextResponse.json(
        {
          ok: true,
          company: { id: companyId, name, email, maintenancePercent: m },
        },
        { status: 201 },
      );
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('POST /api/admin/companies error:', err);
      return NextResponse.json(
        { ok: false, error: 'create_error' },
        { status: 500 },
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('POST /api/admin/companies error:', err);
    return NextResponse.json(
      { ok: false, error: 'create_error' },
      { status: 500 },
    );
  }
}
