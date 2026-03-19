import { NextRequest, NextResponse } from 'next/server';
import { CarRepository } from '@/lib/repository/CarRepository';
import { OfficeRepository } from '@/lib/repository/OfficeRepository';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params; // Await the params object to unwrap it
  const carId = Number(id);

  if (isNaN(carId)) {
    return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
  }

  try {
    console.log(`Fetching car with ID: ${carId}`);
    const car = await CarRepository.findById(carId);

    if (!car) {
      console.log('Car not found');
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    console.log(`Car found: ${JSON.stringify(car)}`);

    if (!car.officeId) {
      console.log('Car does not have an associated office');
      return NextResponse.json(
        { error: 'Car does not have an associated office' },
        { status: 404 },
      );
    }

    console.log(`Fetching office with ID: ${car.officeId}`);
    const office = await OfficeRepository.findById(car.officeId);

    if (!office) {
      console.log('Office not found');
      return NextResponse.json({ error: 'Office not found' }, { status: 404 });
    }

    console.log(`Office found: ${JSON.stringify(office)}`);
    return NextResponse.json(office, { status: 200 });
  } catch (error) {
    console.error('Error fetching office details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch office details' },
      { status: 500 },
    );
  }
}
