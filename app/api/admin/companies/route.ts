import { NextResponse } from 'next/server';
import { CarRepository } from '@/lib/repository/CarRepository';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { buildAuditActor } from '@/lib/audit/buildAuditActor';
import { safeLogAuditEvent } from '@/lib/audit/logAuditEvent';

type DeleteCarBody = {
  id?: unknown;
};

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  try {
    const cars = await CarRepository.findMany();
    return NextResponse.json({ ok: true, cars });
  } catch (err) {
    console.error('GET /api/admin/cars error:', err);
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  const actor = buildAuditActor(check.user);

  try {
    const body = (await req.json()) as DeleteCarBody;
    const id = Number(body.id);

    if (!id || Number.isNaN(id)) {
      await safeLogAuditEvent(req, {
        entityType: 'CAR',
        operation: 'DELETE',
        status: 'FAILURE',
        action: 'Admin failed to delete car',
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

    const car = await CarRepository.findById(id);
    if (!car) {
      await safeLogAuditEvent(req, {
        entityType: 'CAR',
        operation: 'DELETE',
        status: 'FAILURE',
        action: 'Admin failed to delete car',
        targetEntityId: id,
        actor,
        companyId: null,
        metadata: {
          reason: 'not_found',
        },
        errorMessage: 'not_found',
      });

      return NextResponse.json(
        { ok: false, error: 'not_found' },
        { status: 404 },
      );
    }

    await CarRepository.delete(id);

    await safeLogAuditEvent(req, {
      entityType: 'CAR',
      operation: 'DELETE',
      status: 'SUCCESS',
      action: 'Admin deleted car',
      targetEntityId: id,
      actor,
      companyId: car.companyId ?? null,
      metadata: {
        deletedCar: {
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          officeId: car.officeId ?? null,
          companyId: car.companyId ?? null,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/cars error:', err);

    const message = err instanceof Error ? err.message : 'delete_error';

    await safeLogAuditEvent(req, {
      entityType: 'CAR',
      operation: 'DELETE',
      status: 'FAILURE',
      action: 'Admin failed to delete car',
      targetEntityId: null,
      actor,
      companyId: actor.companyId,
      metadata: {},
      errorMessage: message,
    });

    return NextResponse.json(
      { ok: false, error: 'delete_error' },
      { status: 500 },
    );
  }
}
