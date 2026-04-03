import { NextResponse } from 'next/server';
import { AuthError, requireAuthUserFromRequest } from '@/lib/auth';
import { UserRepository } from '@/lib/repository/UserRepository';
import { buildAuditActor } from '@/lib/audit/buildAuditActor';
import { safeLogAuditEvent } from '@/lib/audit/logAuditEvent';
import type { AuditActor } from '@/types/audit';

type ProfileUpdatePayload = {
  name?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  country?: unknown;
  postalCode?: unknown;
  dateOfBirth?: unknown;
};

export async function PUT(req: Request) {
  try {
    const user = await requireAuthUserFromRequest(req);
    const actor = buildAuditActor(user);

    const body = (await req.json()) as ProfileUpdatePayload;
    const { name, phone, address, city, country, postalCode, dateOfBirth } =
      body;

    const before = {
      name: user.name ?? null,
      phone: user.phone ?? null,
      address: user.address ?? null,
      city: user.city ?? null,
      country: user.country ?? null,
      postalCode: user.postalCode ?? null,
      dateOfBirth: user.dateOfBirth ?? null,
    };

    const updateData: Partial<{
      name: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      postalCode: string;
      dateOfBirth: Date | undefined;
    }> = {};

    if (name !== undefined) updateData.name = String(name);
    if (phone !== undefined) updateData.phone = String(phone);
    if (address !== undefined) updateData.address = String(address);
    if (city !== undefined) updateData.city = String(city);
    if (country !== undefined) updateData.country = String(country);
    if (postalCode !== undefined) updateData.postalCode = String(postalCode);

    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth
        ? new Date(String(dateOfBirth))
        : undefined;
    }

    const updated = await UserRepository.update(user.id, updateData);

    await safeLogAuditEvent(req, {
      entityType: 'USER',
      operation: 'PROFILE_UPDATE',
      status: 'SUCCESS',
      action: 'User updated profile data',
      targetEntityId: user.id,
      actor,
      companyId: user.companyId ?? null,
      metadata: {
        source: '/profile',
        before,
        changedFields: Object.keys(updateData),
        after: updated
          ? {
              name: updated.name ?? null,
              phone: updated.phone ?? null,
              address: updated.address ?? null,
              city: updated.city ?? null,
              country: updated.country ?? null,
              postalCode: updated.postalCode ?? null,
              dateOfBirth: updated.dateOfBirth ?? null,
            }
          : null,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updated,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      await safeLogAuditEvent(req, {
        entityType: 'USER',
        operation: 'PROFILE_UPDATE',
        status: 'FAILURE',
        action: 'User profile update failed',
        targetEntityId: null,
        actor: {
          userId: null,
          role: null,
          email: null,
          displayName: null,
          companyId: null,
        },
        metadata: {
          source: '/profile',
        },
        errorMessage: err.message,
      });

      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }

    console.error('PUT /api/user/profile error:', err);

    const message = err instanceof Error ? err.message : 'Server error';

    let actor: AuditActor = {
      userId: null,
      role: null,
      email: null,
      displayName: null,
      companyId: null,
    };

    try {
      const authUser = await requireAuthUserFromRequest(req);
      actor = buildAuditActor(authUser);
    } catch {
      // ignore
    }

    await safeLogAuditEvent(req, {
      entityType: 'USER',
      operation: 'PROFILE_UPDATE',
      status: 'FAILURE',
      action: 'User profile update failed',
      targetEntityId: actor.userId,
      actor,
      companyId: actor.companyId,
      metadata: {
        source: '/profile',
      },
      errorMessage: message,
    });

    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
