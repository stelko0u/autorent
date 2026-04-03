import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repository/UserRepository';
import { deleteUserDeep } from '@/lib/services/admin/deleteEntity';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { buildAuditActor } from '@/lib/audit/buildAuditActor';
import { safeLogAuditEvent } from '@/lib/audit/logAuditEvent';

type DeleteUserBody = {
  id?: unknown;
};

type UpdateUserBanBody = {
  id?: unknown;
  action?: unknown;
  reason?: unknown;
};

export async function GET(req: NextRequest) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  try {
    const users = await UserRepository.findMany();
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    return NextResponse.json({ ok: true, users: sanitizedUsers });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  const actor = buildAuditActor(check.user);

  try {
    const body = (await req.json()) as DeleteUserBody;
    const id = Number(body.id);

    if (!id || Number.isNaN(id)) {
      await safeLogAuditEvent(req, {
        entityType: 'USER',
        operation: 'DELETE',
        status: 'FAILURE',
        action: 'Admin failed to delete user',
        targetEntityId: null,
        actor,
        companyId: actor.companyId,
        metadata: {
          reason: 'id_required',
        },
        errorMessage: 'id_required',
      });

      return NextResponse.json(
        { ok: false, error: 'id_required' },
        { status: 400 },
      );
    }

    const targetUser = await UserRepository.findById(id);

    if (!targetUser) {
      await safeLogAuditEvent(req, {
        entityType: 'USER',
        operation: 'DELETE',
        status: 'FAILURE',
        action: 'Admin failed to delete user',
        targetEntityId: id,
        actor,
        companyId: actor.companyId,
        metadata: {
          reason: 'user_not_found',
        },
        errorMessage: 'user_not_found',
      });

      return NextResponse.json(
        { ok: false, error: 'user_not_found' },
        { status: 404 },
      );
    }

    await deleteUserDeep(id);

    await safeLogAuditEvent(req, {
      entityType: 'USER',
      operation: 'DELETE',
      status: 'SUCCESS',
      action: 'Admin deleted user',
      targetEntityId: id,
      actor,
      companyId: targetUser.companyId ?? null,
      metadata: {
        deletedUser: {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          companyId: targetUser.companyId ?? null,
          banned: targetUser.banned ?? false,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/users error:', err);

    const message = err instanceof Error ? err.message : 'delete_error';

    await safeLogAuditEvent(req, {
      entityType: 'USER',
      operation: 'DELETE',
      status: 'FAILURE',
      action: 'Admin failed to delete user',
      targetEntityId: null,
      actor,
      companyId: actor.companyId,
      metadata: {},
      errorMessage: message,
    });

    if (message === 'user_not_found') {
      return NextResponse.json(
        { ok: false, error: 'user_not_found' },
        { status: 404 },
      );
    }

    if (message === 'cannot_delete_admin') {
      return NextResponse.json(
        { ok: false, error: 'cannot_delete_admin' },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { ok: false, error: 'delete_error' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  const actor = buildAuditActor(check.user);

  try {
    const body = (await req.json()) as UpdateUserBanBody;
    const id = Number(body.id);
    const action = String(body.action ?? '');
    const reason =
      body.reason === undefined || body.reason === null
        ? null
        : String(body.reason);

    if (!id || Number.isNaN(id) || !action) {
      await safeLogAuditEvent(req, {
        entityType: 'USER',
        operation: action === 'unban' ? 'UNBAN' : 'BAN',
        status: 'FAILURE',
        action: 'Admin failed to change user ban state',
        targetEntityId: Number.isNaN(id) ? null : id,
        actor,
        companyId: actor.companyId,
        metadata: {
          reason: 'id_and_action_required',
        },
        errorMessage: 'id_and_action_required',
      });

      return NextResponse.json(
        { ok: false, error: 'id_and_action_required' },
        { status: 400 },
      );
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      await safeLogAuditEvent(req, {
        entityType: 'USER',
        operation: action === 'unban' ? 'UNBAN' : 'BAN',
        status: 'FAILURE',
        action: 'Admin failed to change user ban state',
        targetEntityId: id,
        actor,
        companyId: actor.companyId,
        metadata: {
          reason: 'user_not_found',
        },
        errorMessage: 'user_not_found',
      });

      return NextResponse.json(
        { ok: false, error: 'user_not_found' },
        { status: 404 },
      );
    }

    if (user.role === 'ADMIN') {
      await safeLogAuditEvent(req, {
        entityType: 'USER',
        operation: action === 'unban' ? 'UNBAN' : 'BAN',
        status: 'FAILURE',
        action: 'Admin failed to change user ban state',
        targetEntityId: id,
        actor,
        companyId: user.companyId ?? null,
        metadata: {
          reason: 'cannot_ban_admin',
          targetRole: user.role,
        },
        errorMessage: 'cannot_ban_admin',
      });

      return NextResponse.json(
        { ok: false, error: 'cannot_ban_admin' },
        { status: 403 },
      );
    }

    let updatedUser = null;

    if (action === 'ban') {
      updatedUser = await UserRepository.ban(id, reason ?? undefined);
    } else if (action === 'unban') {
      updatedUser = await UserRepository.unban(id);
    } else {
      await safeLogAuditEvent(req, {
        entityType: 'USER',
        operation: 'UPDATE',
        status: 'FAILURE',
        action: 'Admin failed to change user ban state',
        targetEntityId: id,
        actor,
        companyId: user.companyId ?? null,
        metadata: {
          reason: 'invalid_action',
          action,
        },
        errorMessage: 'invalid_action',
      });

      return NextResponse.json(
        { ok: false, error: 'invalid_action' },
        { status: 400 },
      );
    }

    await safeLogAuditEvent(req, {
      entityType: 'USER',
      operation: action === 'ban' ? 'BAN' : 'UNBAN',
      status: 'SUCCESS',
      action: action === 'ban' ? 'Admin banned user' : 'Admin unbanned user',
      targetEntityId: id,
      actor,
      companyId: updatedUser?.companyId ?? user.companyId ?? null,
      metadata: {
        targetUser: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        reason: reason ?? null,
      },
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (err) {
    console.error('PATCH /api/admin/users error:', err);

    const message = err instanceof Error ? err.message : 'update_error';

    await safeLogAuditEvent(req, {
      entityType: 'USER',
      operation: 'UPDATE',
      status: 'FAILURE',
      action: 'Admin failed to change user ban state',
      targetEntityId: null,
      actor,
      companyId: actor.companyId,
      metadata: {},
      errorMessage: message,
    });

    return NextResponse.json(
      { ok: false, error: 'update_error' },
      { status: 500 },
    );
  }
}
