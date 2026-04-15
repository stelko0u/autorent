'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import CarImageCropper from './CarImageCropper';
import { Images, Plus } from '../icons';
import {
  CompanyPanelCard,
  CompanyPanelInfoCard,
  CompanyPanelPageHeader,
} from './CompanyPanelUI';
import { createCompanyCar, getCompanyOffices } from '@/lib/api/companyApi';
import { useTranslation } from '@/providers/LanguageProvider';
import {
  carTypeKey,
  fuelTypeKey,
  transmissionKey,
} from '@/lib/utils/vehicleLocalization';

type FileWithPreview = File & { __preview: string };

interface AddCarFormProps {
  onCreated?: (car: unknown) => void;
}

interface OfficeOption {
  id: number;
  name?: string;
  address?: string;
}

const MAX_FILES = 12;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

function currentYear() {
  return new Date().getFullYear();
}

export default function AddCarForm({ onCreated }: AddCarFormProps) {
  const { t } = useTranslation();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [pricePerDay, setPricePerDay] = useState<number | ''>('');
  const [power, setPower] = useState<number | ''>('');
  const [displacement, setDisplacement] = useState<number | ''>('');
  const [carType, setCarType] = useState<string | ''>('');
  const [transmission, setTransmission] = useState<string | ''>('');
  const [fuelType, setFuelType] = useState<string | ''>('');
  const [officeId, setOfficeId] = useState<number | ''>('');
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentImageToCrop, setCurrentImageToCrop] = useState<string | null>(
    null,
  );
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        try {
          URL.revokeObjectURL(file.__preview);
        } catch {}
      });

      if (currentImageToCrop) {
        try {
          URL.revokeObjectURL(currentImageToCrop);
        } catch {}
      }
    };
  }, [files, currentImageToCrop]);

  useEffect(() => {
    async function loadOffices() {
      try {
        const nextOffices = await getCompanyOffices();

        setOffices(
          nextOffices
            .filter(
              (office): office is OfficeOption => typeof office.id === 'number',
            )
            .map((office) => ({
              id: office.id,
              name: office.name,
              address: office.address,
            })),
        );
      } catch {
        setOffices([]);
      }
    }

    void loadOffices();
  }, []);

  const completion = useMemo(() => {
    const fields = [
      make,
      model,
      year,
      pricePerDay,
      power,
      displacement,
      carType,
      transmission,
      fuelType,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [
    make,
    model,
    year,
    pricePerDay,
    power,
    displacement,
    carType,
    transmission,
    fuelType,
  ]);

  const onDrop = (accepted: File[], rejected: FileRejection[]) => {
    setError(null);

    if (rejected.length > 0) {
      setError(t('companyAddCar.rejectedFiles'));
    }

    const valid = accepted.filter((file) => ALLOWED_TYPES.includes(file.type));

    if (files.length + valid.length > MAX_FILES) {
      setError(t('companyAddCar.maxImages', { count: MAX_FILES }));
      return;
    }

    if (valid.length > 0) {
      const imageUrl = URL.createObjectURL(valid[0]);
      setCurrentImageFile(valid[0]);
      setCurrentImageToCrop(imageUrl);
      setShowCropper(true);
    }
  };

  const dropzone = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: true,
  });

  async function handleCropSave(croppedImageDataUrl: string) {
    const response = await fetch(croppedImageDataUrl);
    const blob = await response.blob();

    const croppedFile = new File(
      [blob],
      currentImageFile?.name || 'cropped-image.jpg',
      { type: 'image/jpeg' },
    );

    const fileWithPreview = Object.assign(croppedFile, {
      __preview: URL.createObjectURL(croppedFile),
    });

    setFiles((previous) => [...previous, fileWithPreview]);
    setShowCropper(false);

    if (currentImageToCrop) {
      try {
        URL.revokeObjectURL(currentImageToCrop);
      } catch {}
    }

    setCurrentImageToCrop(null);
    setCurrentImageFile(null);
  }

  function removeImage(index: number) {
    setFiles((previous) => {
      const target = previous[index];

      if (target) {
        try {
          URL.revokeObjectURL(target.__preview);
        } catch {}
      }

      return previous.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setBusy(true);
      setError(null);

      if (
        !make ||
        !model ||
        !year ||
        !pricePerDay ||
        !power ||
        !displacement ||
        !carType ||
        !transmission ||
        !fuelType
      ) {
        throw new Error(t('companyAddCar.requiredFields'));
      }

      if (typeof year === 'number' && (year < 1980 || year > currentYear())) {
        throw new Error(
          t('companyAddCar.yearRange', { year: currentYear() }),
        );
      }

      if (
        typeof pricePerDay === 'number' &&
        typeof power === 'number' &&
        typeof displacement === 'number' &&
        (pricePerDay <= 0 || power <= 0 || displacement <= 0)
      ) {
        throw new Error(
          t('companyAddCar.positiveValues'),
        );
      }

      const formData = new FormData();
      formData.append('make', make.trim());
      formData.append('model', model.trim());
      formData.append('year', String(year));
      formData.append('pricePerDay', String(pricePerDay));
      formData.append('power', String(power));
      formData.append('displacement', String(displacement));
      formData.append('carType', carType);
      formData.append('transmission', transmission);
      formData.append('fuelType', fuelType);

      if (officeId) {
        formData.append('officeId', String(officeId));
      }

      files.forEach((file) => {
        formData.append('images', file);
      });

      const createdCar = await createCompanyCar(formData);

      setMake('');
      setModel('');
      setYear('');
      setPricePerDay('');
      setPower('');
      setDisplacement('');
      setCarType('');
      setTransmission('');
      setFuelType('');
      setOfficeId('');
      setFiles([]);

      onCreated?.(createdCar);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t('companyAddCar.failedCreateCar'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <CompanyPanelPageHeader
        eyebrow={t('companyAddCar.eyebrow')}
        title={t('companyAddCar.title')}
        description={t('companyAddCar.description')}
        rightSlot={
          <div className="grid gap-3 sm:grid-cols-2">
            <CompanyPanelInfoCard
              label={t('companyAddCar.formCompletion')}
              value={`${completion}%`}
              description={t('companyAddCar.formCompletionDescription')}
            />
            <CompanyPanelInfoCard
              label={t('companyAddCar.imagesSelected')}
              value={String(files.length)}
              description={t('companyAddCar.imagesDescription', {
                count: MAX_FILES,
              })}
              tone="success"
            />
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <CompanyPanelCard
          title={t('companyAddCar.vehicleDetails')}
          description={t('companyAddCar.vehicleDetailsDescription')}
        >
          <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-3 sm:px-8">
            <InputField label={t('vehicle.brand')} value={make} onChange={setMake} />
            <InputField label={t('vehicle.model')} value={model} onChange={setModel} />
            <InputField
              label={t('vehicle.year')}
              type="number"
              value={year}
              onChange={(value) => setYear(value === '' ? '' : Number(value))}
            />
            <InputField
              label={t('companyAddCar.pricePerDay')}
              type="number"
              value={pricePerDay}
              onChange={(value) =>
                setPricePerDay(value === '' ? '' : Number(value))
              }
            />
            <InputField
              label={t('companyAddCar.power')}
              type="number"
              value={power}
              onChange={(value) => setPower(value === '' ? '' : Number(value))}
            />
            <InputField
              label={t('companyAddCar.displacement')}
              type="number"
              value={displacement}
              onChange={(value) =>
                setDisplacement(value === '' ? '' : Number(value))
              }
            />

            <SelectField
              label={t('vehicle.bodyType')}
              value={carType}
              onChange={setCarType}
              placeholder={t('companyAddCar.select')}
              getOptionLabel={(option) => {
                const key = carTypeKey(option);
                return key ? t(`vehicle.bodyTypes.${key}`) : option;
              }}
              options={[
                'SEDAN',
                'HATCHBACK',
                'SUV',
                'COUPE',
                'CONVERTIBLE',
                'CABRIO',
                'WAGON',
                'VAN',
                'PICKUP',
                'COMBI',
                'OTHER',
              ]}
            />

            <SelectField
              label={t('vehicle.transmission')}
              value={transmission}
              onChange={setTransmission}
              placeholder={t('companyAddCar.select')}
              getOptionLabel={(option) => {
                const key = transmissionKey(option);
                return key ? t(`vehicle.transmissions.${key}`) : option;
              }}
              options={['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC', 'OTHER']}
            />

            <SelectField
              label={t('vehicle.fuelType')}
              value={fuelType}
              onChange={setFuelType}
              placeholder={t('companyAddCar.select')}
              getOptionLabel={(option) => {
                const key = fuelTypeKey(option);
                return key ? t(`vehicle.fuelTypes.${key}`) : option;
              }}
              options={['PETROL', 'DIESEL', 'ELECTRICITY']}
            />

            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('companySidebar.offices')}
              </label>
              <select
                value={officeId}
                onChange={(event) =>
                  setOfficeId(
                    event.target.value === '' ? '' : Number(event.target.value),
                  )
                }
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">{t('companyAddCar.selectOfficeOptional')}</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name || office.address || t('companyAddCar.officeFallback', { id: office.id })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CompanyPanelCard>

        <CompanyPanelCard
          title={t('companyAddCar.gallery')}
          description={t('companyAddCar.galleryDescription')}
        >
          <div className="px-6 py-6 sm:px-8">
            <div
              {...dropzone.getRootProps()}
              className="cursor-pointer rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center transition hover:bg-indigo-50"
            >
              <input {...dropzone.getInputProps()} />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <Images className="h-7 w-7" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-gray-900">
                {t('companyAddCar.dropImages')}
              </h4>
              <p className="mt-2 text-sm text-gray-500">
                {t('companyAddCar.pngJpegOnly')}
              </p>
            </div>

            {files.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.__preview}
                      alt={file.name}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="mt-3 inline-flex h-10 items-center rounded-xl bg-red-50 px-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
                      >
                        {t('companyAddCar.remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </CompanyPanelCard>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Plus className="mr-2 h-4 w-4" />
            {busy ? t('companyAddCar.creating') : t('companyAddCar.createListing')}
          </button>
        </div>
      </form>

      {showCropper && currentImageToCrop ? (
        <div className="p-6">
          <CarImageCropper image={currentImageToCrop} onSave={handleCropSave} />
        </div>
      ) : null}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string | number | '';
  onChange: (value: string) => void;
  type?: 'text' | 'number';
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  getOptionLabel?: (option: string) => string;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  getOptionLabel,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel ? getOptionLabel(option) : option.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}
