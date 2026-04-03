import { NextRequest, NextResponse } from 'next/server';
import {
  createCompanyOffice,
  deleteCompanyOffice,
  getCompanyOffices,
  updateCompanyOffice,
} from '@/lib/services/company/companyOfficesService';
import { handleCompanyOfficesError } from '@/lib/errors/handleCompanyOfficesError';
import { requireAuthUserFromRequest } from '@/lib/auth';
import { buildAuditActor } from '@/lib/audit/buildAuditActor';
import { safeLogAuditEvent } from '@/lib/audit/logAuditEvent';
import { OfficeRepository } from '@/lib/repository/OfficeRepository';

type OfficeBody = {
  id?: unknown;
  name?: unknown;
  address?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

async function getCompanyActor(req: Request) {
  const user = await requireAuthUserFromRequest(req);

  if (user.role !== 'COMPANY' || !user.companyId) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

export async function GET() {
  try {
    const result = await getCompanyOffices();
    return NextResponse.json(result);
  } catch (err: unknown) {
    return handleCompanyOfficesError(err, 'GET');
  }
}

export async function POST(req: NextRequest) {
  let companyUser: Awaited<ReturnType<typeof getCompanyActor>> | null = null;

  try {
    companyUser = await getCompanyActor(req);
    const actor = buildAuditActor(companyUser);

    const body = (await req.json()) as OfficeBody;
    const result = await createCompanyOffice(body);

    if (!result.office) {
      await safeLogAuditEvent(req, {
        entityType: 'OFFICE',
        operation: 'CREATE',
        status: 'FAILURE',
        action: 'Company failed to add office',
        targetEntityId: null,
        actor,
        companyId: companyUser.companyId ?? null,
        metadata: {
          reason: 'office_not_returned',
        },
        errorMessage: 'office_not_returned',
      });

      return NextResponse.json(
        { ok: false, error: 'office_not_returned' },
        { status: 500 },
      );
    }

    await safeLogAuditEvent(req, {
      entityType: 'OFFICE',
      operation: 'CREATE',
      status: 'SUCCESS',
      action: 'Company added office',
      targetEntityId: result.office.id,
      actor,
      companyId: companyUser.companyId ?? null,
      metadata: {
        office: {
          id: result.office.id,
          name: result.office.name ?? null,
          address: result.office.address ?? null,
          latitude: result.office.latitude,
          longitude: result.office.longitude,
        },
      },
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'office_create_failed';

    if (companyUser) {
      await safeLogAuditEvent(req, {
        entityType: 'OFFICE',
        operation: 'CREATE',
        status: 'FAILURE',
        action: 'Company failed to add office',
        targetEntityId: null,
        actor: buildAuditActor(companyUser),
        companyId: companyUser.companyId ?? null,
        metadata: {},
        errorMessage: message,
      });
    }

    return handleCompanyOfficesError(err, 'POST');
  }
}

export async function PATCH(req: NextRequest) {
  let companyUser: Awaited<ReturnType<typeof getCompanyActor>> | null = null;
  let officeId: number | null = null;

  try {
    companyUser = await getCompanyActor(req);
    const actor = buildAuditActor(companyUser);

    const body = (await req.json()) as OfficeBody;
    officeId =
      body.id !== undefined && body.id !== null ? Number(body.id) : null;

    const before =
      officeId !== null && Number.isFinite(officeId)
        ? await OfficeRepository.findById(officeId)
        : null;

    const result = await updateCompanyOffice(body);

    if (!result.office) {
      await safeLogAuditEvent(req, {
        entityType: 'OFFICE',
        operation: 'UPDATE',
        status: 'FAILURE',
        action: 'Company failed to edit office',
        targetEntityId: officeId,
        actor,
        companyId: companyUser.companyId ?? null,
        metadata: {
          reason: 'office_not_returned',
        },
        errorMessage: 'office_not_returned',
      });

      return NextResponse.json(
        { ok: false, error: 'office_not_returned' },
        { status: 500 },
      );
    }

    await safeLogAuditEvent(req, {
      entityType: 'OFFICE',
      operation: 'UPDATE',
      status: 'SUCCESS',
      action: 'Company edited office',
      targetEntityId: result.office.id,
      actor,
      companyId: companyUser.companyId ?? null,
      metadata: {
        before: before
          ? {
              id: before.id,
              name: before.name ?? null,
              address: before.address ?? null,
              latitude: before.latitude,
              longitude: before.longitude,
            }
          : null,
        after: {
          id: result.office.id,
          name: result.office.name ?? null,
          address: result.office.address ?? null,
          latitude: result.office.latitude,
          longitude: result.office.longitude,
        },
      },
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'office_update_failed';

    if (companyUser) {
      await safeLogAuditEvent(req, {
        entityType: 'OFFICE',
        operation: 'UPDATE',
        status: 'FAILURE',
        action: 'Company failed to edit office',
        targetEntityId: officeId,
        actor: buildAuditActor(companyUser),
        companyId: companyUser.companyId ?? null,
        metadata: {},
        errorMessage: message,
      });
    }

    return handleCompanyOfficesError(err, 'PATCH');
  }
}

export async function DELETE(req: NextRequest) {
  let companyUser: Awaited<ReturnType<typeof getCompanyActor>> | null = null;
  let officeId: number | null = null;

  try {
    companyUser = await getCompanyActor(req);
    const actor = buildAuditActor(companyUser);

    const body = (await req.json()) as OfficeBody;
    officeId =
      body.id !== undefined && body.id !== null ? Number(body.id) : null;

    const existingOffice =
      officeId !== null && Number.isFinite(officeId)
        ? await OfficeRepository.findById(officeId)
        : null;

    const result = await deleteCompanyOffice(body);

    await safeLogAuditEvent(req, {
      entityType: 'OFFICE',
      operation: 'DELETE',
      status: 'SUCCESS',
      action: 'Company deleted office',
      targetEntityId: officeId,
      actor,
      companyId: companyUser.companyId ?? null,
      metadata: {
        deletedOffice: existingOffice
          ? {
              id: existingOffice.id,
              name: existingOffice.name ?? null,
              address: existingOffice.address ?? null,
              latitude: existingOffice.latitude,
              longitude: existingOffice.longitude,
            }
          : null,
      },
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'office_delete_failed';

    if (companyUser) {
      await safeLogAuditEvent(req, {
        entityType: 'OFFICE',
        operation: 'DELETE',
        status: 'FAILURE',
        action: 'Company failed to delete office',
        targetEntityId: officeId,
        actor: buildAuditActor(companyUser),
        companyId: companyUser.companyId ?? null,
        metadata: {},
        errorMessage: message,
      });
    }

    return handleCompanyOfficesError(err, 'DELETE');
  }
}
