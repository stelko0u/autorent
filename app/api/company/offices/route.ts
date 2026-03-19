import { fetchMe } from '@/lib/api';
import { OfficeRepository } from '@/lib/repository/OfficeRepository';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(req: NextRequest) {
  try {
    const meRes = await fetchMe(req);
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const me = await meRes.json();
    const companyId = me?.company?.id ?? me?.user?.companyId ?? null;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing company ID' },
        { status: 400 },
      );
    }

    const offices = await OfficeRepository.findManyByCompanyId(companyId);

    return NextResponse.json({ offices }, { status: 200 });
  } catch (err) {
    console.error('company/offices GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, address, latitude, longitude, companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing required field: companyId' },
        { status: 400 },
      );
    }

    const office = await OfficeRepository.create({
      name,
      address,
      latitude,
      longitude,
      companyId: Number(companyId),
    });

    return NextResponse.json(office, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create office' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 },
      );
    }

    await OfficeRepository.delete(Number(id));

    return NextResponse.json(
      { message: 'Office deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete office' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 },
      );
    }

    const updatedOffice = await OfficeRepository.update(Number(id), data);

    if (!updatedOffice) {
      return NextResponse.json({ error: 'Office not found' }, { status: 404 });
    }

    return NextResponse.json(updatedOffice, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update office' },
      { status: 500 },
    );
  }
}
