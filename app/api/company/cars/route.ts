import { NextRequest, NextResponse } from 'next/server';
import { requireCompanyUser } from '@/lib/auth/requireCompany';
import { requireAuthUserFromRequest } from '@/lib/auth';
import { handleCompanyCarsError } from '@/lib/errors/handleCompanyCarsError';
import {
  createCompanyCar,
  deleteCompanyCar,
  getCompanyCars,
  updateCompanyCar,
} from '@/lib/services/company/companyCarsService';
import { buildAuditActor } from '@/lib/audit/buildAuditActor';
import { safeLogAuditEvent } from '@/lib/audit/logAuditEvent';
import { CarRepository } from '@/lib/repository/CarRepository';

export const runtime = 'nodejs';

async function getCompanyActor(req: Request) {
  const user = await requireAuthUserFromRequest(req);

  if (user.role !== 'COMPANY' || !user.companyId) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

function parseCarId(req: NextRequest): number | null {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get('id');

  if (!rawId) {
    return null;
  }

  const carId = Number(rawId);

  if (!Number.isFinite(carId)) {
    return null;
  }

  return carId;
}

export async function GET() {
  try {
    const user = await requireCompanyUser();
    const cars = await getCompanyCars(user.companyId);
    return NextResponse.json({ cars }, { status: 200 });
  } catch (error) {
    return handleCompanyCarsError(error);
  }
}

export async function POST(req: NextRequest) {
  let authUser: Awaited<ReturnType<typeof getCompanyActor>> | null = null;

  try {
    authUser = await getCompanyActor(req);
    const serviceUser = await requireCompanyUser();
    const car = await createCompanyCar(req, serviceUser);

    await safeLogAuditEvent(req, {
      entityType: 'CAR',
      operation: 'CREATE',
      status: 'SUCCESS',
      action: 'Company added car',
      targetEntityId: car.id,
      actor: buildAuditActor(authUser),
      companyId: authUser.companyId ?? null,
      metadata: {
        car: {
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          officeId: car.officeId ?? null,
          companyId: car.companyId ?? null,
        },
      },
    });

    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'car_create_failed';

    if (authUser) {
      await safeLogAuditEvent(req, {
        entityType: 'CAR',
        operation: 'CREATE',
        status: 'FAILURE',
        action: 'Company failed to add car',
        targetEntityId: null,
        actor: buildAuditActor(authUser),
        companyId: authUser.companyId ?? null,
        metadata: {},
        errorMessage: message,
      });
    }

    return handleCompanyCarsError(error);
  }
}

export async function DELETE(req: NextRequest) {
  let authUser: Awaited<ReturnType<typeof getCompanyActor>> | null = null;
  let carId: number | null = null;

  try {
    authUser = await getCompanyActor(req);
    const serviceUser = await requireCompanyUser();
    carId = parseCarId(req);

    if (carId === null) {
      await safeLogAuditEvent(req, {
        entityType: 'CAR',
        operation: 'DELETE',
        status: 'FAILURE',
        action: 'Company failed to delete car',
        targetEntityId: null,
        actor: buildAuditActor(authUser),
        companyId: authUser.companyId ?? null,
        metadata: {
          reason: 'invalid_or_missing_id',
        },
        errorMessage: 'invalid_or_missing_id',
      });

      return NextResponse.json({ error: 'Invalid car id' }, { status: 400 });
    }

    const carBefore = await CarRepository.findById(carId);

    await deleteCompanyCar(carId, serviceUser.companyId);

    await safeLogAuditEvent(req, {
      entityType: 'CAR',
      operation: 'DELETE',
      status: 'SUCCESS',
      action: 'Company deleted car',
      targetEntityId: carId,
      actor: buildAuditActor(authUser),
      companyId: authUser.companyId ?? null,
      metadata: {
        deletedCar: carBefore
          ? {
              id: carBefore.id,
              make: carBefore.make,
              model: carBefore.model,
              year: carBefore.year,
              officeId: carBefore.officeId ?? null,
              companyId: carBefore.companyId ?? null,
            }
          : null,
      },
    });

    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'car_delete_failed';

    if (authUser) {
      await safeLogAuditEvent(req, {
        entityType: 'CAR',
        operation: 'DELETE',
        status: 'FAILURE',
        action: 'Company failed to delete car',
        targetEntityId: carId,
        actor: buildAuditActor(authUser),
        companyId: authUser.companyId ?? null,
        metadata: {},
        errorMessage: message,
      });
    }

    return handleCompanyCarsError(error);
  }
}

export async function PATCH(req: NextRequest) {
  let authUser: Awaited<ReturnType<typeof getCompanyActor>> | null = null;
  let carId: number | null = null;

  try {
    authUser = await getCompanyActor(req);
    carId = parseCarId(req);

    if (carId === null) {
      await safeLogAuditEvent(req, {
        entityType: 'CAR',
        operation: 'UPDATE',
        status: 'FAILURE',
        action: 'Company failed to edit car',
        targetEntityId: null,
        actor: buildAuditActor(authUser),
        companyId: authUser.companyId ?? null,
        metadata: {
          reason: 'invalid_or_missing_id',
        },
        errorMessage: 'invalid_or_missing_id',
      });

      return NextResponse.json({ error: 'Invalid car id' }, { status: 400 });
    }

    const carBefore = await CarRepository.findById(carId);
    const car = await updateCompanyCar(req, carId, Number(authUser.companyId));

    await safeLogAuditEvent(req, {
      entityType: 'CAR',
      operation: 'UPDATE',
      status: 'SUCCESS',
      action: 'Company edited car',
      targetEntityId: car.id,
      actor: buildAuditActor(authUser),
      companyId: authUser.companyId ?? null,
      metadata: {
        before: carBefore
          ? {
              id: carBefore.id,
              make: carBefore.make,
              model: carBefore.model,
              year: carBefore.year,
              pricePerDay: carBefore.pricePerDay,
              officeId: carBefore.officeId ?? null,
              carType: carBefore.carType,
              transmissionType: carBefore.transmissionType,
              fuelType: carBefore.fuelType,
            }
          : null,
        after: {
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          pricePerDay: car.pricePerDay,
          officeId: car.officeId ?? null,
          carType: car.carType,
          transmissionType: car.transmissionType,
          fuelType: car.fuelType,
        },
      },
    });

    return NextResponse.json({ car }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'car_update_failed';

    if (authUser) {
      await safeLogAuditEvent(req, {
        entityType: 'CAR',
        operation: 'UPDATE',
        status: 'FAILURE',
        action: 'Company failed to edit car',
        targetEntityId: carId,
        actor: buildAuditActor(authUser),
        companyId: authUser.companyId ?? null,
        metadata: {},
        errorMessage: message,
      });
    }

    return handleCompanyCarsError(error);
  }
}
