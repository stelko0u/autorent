import React, { useState } from 'react';
import Modal from 'react-modal';
import { Car } from '@/types/types';
import { updateCar } from '@/lib/api/adminApi';
import { useTranslation } from '@/providers/LanguageProvider';
import {
  carTypeKey,
  fuelTypeKey,
  transmissionKey,
} from '@/lib/utils/vehicleLocalization';

interface EditCarModalProps {
  car: Car;
  onClose: () => void;
  onSuccess: () => void;
}

if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

export default function EditCarModal({
  car,
  onClose,
  onSuccess,
}: EditCarModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Car>>({
    make: car.make,
    model: car.model,
    year: car.year,
    pricePerDay: car.pricePerDay,
    carType: car.carType,
    transmissionType: car.transmissionType,
    fuelType: car.fuelType,
    power: car.power,
    displacement: car.displacement,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'year' ||
        name === 'pricePerDay' ||
        name === 'power' ||
        name === 'displacement'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCar(car.id, formData);
      onSuccess();
    } catch (error: unknown) {
      console.error('Error updating car:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel={t('editCarModal.title')}
      className="bg-white rounded-lg py-4 max-w-lg w-full relative z-50 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
    >
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('editCarModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vehicle.brand')}
              </label>
              <input
                type="text"
                name="make"
                value={formData.make || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vehicle.model')}
              </label>
              <input
                type="text"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vehicle.year')}
              </label>
              <input
                type="number"
                name="year"
                value={formData.year || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vehicle.pricePerDay')}
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vehicle.bodyType')}
              </label>
              <select
                name="carType"
                value={formData.carType || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('editCarModal.selectType')}</option>
                {[
                  'SUV',
                  'SEDAN',
                  'HATCHBACK',
                  'COUPE',
                  'CONVERTIBLE',
                  'WAGON',
                  'VAN',
                  'PICKUP',
                  'OTHER',
                ].map((option) => {
                  const key = carTypeKey(option);
                  return (
                    <option key={option} value={option}>
                      {key ? t(`vehicle.bodyTypes.${key}`) : option}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vehicle.transmission')}
              </label>
              <select
                name="transmissionType"
                value={formData.transmissionType || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('editCarModal.selectTransmission')}</option>
                {['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC', 'OTHER'].map(
                  (option) => {
                    const key = transmissionKey(option);
                    return (
                      <option key={option} value={option}>
                        {key ? t(`vehicle.transmissions.${key}`) : option}
                      </option>
                    );
                  },
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vehicle.fuelType')}
              </label>
              <select
                name="fuelType"
                value={formData.fuelType || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('editCarModal.selectFuel')}</option>
                {['PETROL', 'DIESEL', 'ELECTRICITY', 'HYBRID', 'OTHER'].map(
                  (option) => {
                    const key = fuelTypeKey(option);
                    return (
                      <option key={option} value={option}>
                        {key ? t(`vehicle.fuelTypes.${key}`) : option}
                      </option>
                    );
                  },
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('editCarModal.power')}
              </label>
              <input
                type="number"
                name="power"
                value={formData.power || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('editCarModal.displacement')}
              </label>
              <input
                type="number"
                name="displacement"
                value={formData.displacement || ''}
                onChange={handleChange}
                required
                className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? t('profileSettings.saving') : t('profileSettings.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
