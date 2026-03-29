'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  minDate?: string;
}

type OpenPanel = 'start' | 'end' | null;

interface CalendarCell {
  iso: string;
  date: Date;
  label: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
}

interface PopupPosition {
  top: number;
  left: number;
  width: number;
}

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return startOfDay(parsed);
}

function isSameDay(left: Date | null, right: Date | null): boolean {
  if (!left || !right) {
    return false;
  }

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isBeforeDay(left: Date, right: Date): boolean {
  return startOfDay(left).getTime() < startOfDay(right).getTime();
}

function isAfterDay(left: Date, right: Date): boolean {
  return startOfDay(left).getTime() > startOfDay(right).getTime();
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function formatVisibleMonth(date: Date): string {
  return new Intl.DateTimeFormat('bg-BG', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatDisplayDate(value: string, placeholder: string): string {
  const parsed = parseIsoDate(value);

  if (!parsed) {
    return placeholder;
  }

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function buildMonthCells(
  visibleMonth: Date,
  minAllowedDate: Date,
  selectedDate: Date | null,
  rangeStartDate: Date | null,
  rangeEndDate: Date | null,
): CalendarCell[] {
  const firstDayOfMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );

  const firstWeekDay = (firstDayOfMonth.getDay() + 6) % 7;
  const firstGridDate = new Date(
    firstDayOfMonth.getFullYear(),
    firstDayOfMonth.getMonth(),
    1 - firstWeekDay,
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      firstGridDate.getFullYear(),
      firstGridDate.getMonth(),
      firstGridDate.getDate() + index,
    );

    const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
    const isDisabled = isBeforeDay(date, minAllowedDate);
    const isSelected = isSameDay(date, selectedDate);

    const isInRange =
      Boolean(rangeStartDate) &&
      Boolean(rangeEndDate) &&
      !isSameDay(date, rangeStartDate) &&
      !isSameDay(date, rangeEndDate) &&
      !isBeforeDay(date, rangeStartDate as Date) &&
      !isAfterDay(date, rangeEndDate as Date);

    return {
      iso: formatIsoDate(date),
      date,
      label: date.getDate(),
      isCurrentMonth,
      isDisabled,
      isToday: isSameDay(date, startOfDay(new Date())),
      isSelected,
      isInRange,
    };
  });
}

function getCellClasses(cell: CalendarCell): string {
  const baseClasses =
    'flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition';

  if (!cell.isCurrentMonth || cell.isDisabled) {
    return `${baseClasses} cursor-not-allowed text-slate-400 bg-gray-100`;
  }

  if (cell.isSelected) {
    return `${baseClasses} bg-blue-600 text-white shadow-md hover:bg-blue-600`;
  }

  if (cell.isInRange) {
    return `${baseClasses} bg-blue-50 text-blue-700`;
  }

  if (cell.isToday) {
    return `${baseClasses} border border-blue-600 text-slate-900 hover:bg-blue-100`;
  }

  return `${baseClasses} text-slate-700 hover:bg-blue-300`;
}

interface CalendarPopupProps {
  title: string;
  selectedDate: Date | null;
  rangeStartDate: Date | null;
  rangeEndDate: Date | null;
  minAllowedDate: Date;
  visibleMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  canGoPrev: boolean;
  position: PopupPosition;
  popupType: 'start' | 'end';
}

function CalendarPopup({
  title,
  selectedDate,
  rangeStartDate,
  rangeEndDate,
  minAllowedDate,
  visibleMonth,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  canGoPrev,
  position,
  popupType,
}: CalendarPopupProps) {
  const cells = useMemo(
    () =>
      buildMonthCells(
        visibleMonth,
        minAllowedDate,
        selectedDate,
        rangeStartDate,
        rangeEndDate,
      ),
    [visibleMonth, minAllowedDate, selectedDate, rangeStartDate, rangeEndDate],
  );

  return createPortal(
    <div
      data-calendar-popup={popupType}
      className="fixed z-[99999] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {title}
        </p>
        <h4 className="mt-1 text-base font-bold text-slate-900">
          {formatVisibleMonth(visibleMonth)}
        </h4>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrevMonth}
            disabled={!canGoPrev}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Назад
          </button>

          <p className="text-xs text-slate-500">Миналите дати са недостъпни</p>

          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Напред
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              {day}
            </div>
          ))}

          {cells.map((cell) => (
            <button
              key={cell.iso}
              type="button"
              disabled={!cell.isCurrentMonth || cell.isDisabled}
              onClick={() => onSelectDate(cell.date)}
              className={getCellClasses(cell)}
            >
              {cell.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function DateRangePicker({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  minDate,
}: DateRangePickerProps) {
  const absoluteMinDate = useMemo(() => {
    const parsed = parseIsoDate(minDate ?? '');
    return parsed ?? startOfDay(new Date());
  }, [minDate]);

  const selectedStartDate = useMemo(() => parseIsoDate(startDate), [startDate]);
  const selectedEndDate = useMemo(() => parseIsoDate(endDate), [endDate]);

  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [startPopupPosition, setStartPopupPosition] =
    useState<PopupPosition | null>(null);
  const [endPopupPosition, setEndPopupPosition] =
    useState<PopupPosition | null>(null);

  const [startVisibleMonth, setStartVisibleMonth] = useState<Date>(
    new Date(absoluteMinDate.getFullYear(), absoluteMinDate.getMonth(), 1),
  );

  const [endVisibleMonth, setEndVisibleMonth] = useState<Date>(
    new Date(absoluteMinDate.getFullYear(), absoluteMinDate.getMonth(), 1),
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const startTriggerRef = useRef<HTMLDivElement | null>(null);
  const endTriggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function updatePopupPositions() {
    const startRect = startTriggerRef.current?.getBoundingClientRect();
    const endRect = endTriggerRef.current?.getBoundingClientRect();

    if (startRect) {
      setStartPopupPosition({
        top: startRect.bottom + 12,
        left: startRect.left,
        width: startRect.width,
      });
    }

    if (endRect) {
      setEndPopupPosition({
        top: endRect.bottom + 12,
        left: endRect.left,
        width: endRect.width,
      });
    }
  }

  useLayoutEffect(() => {
    updatePopupPositions();
  }, []);

  useEffect(() => {
    function handleResizeOrScroll() {
      updatePopupPositions();
    }

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const clickedInsideRoot = rootRef.current?.contains(target);
      const clickedInsideStartPopup =
        target instanceof Element
          ? target.closest('[data-calendar-popup="start"]')
          : null;
      const clickedInsideEndPopup =
        target instanceof Element
          ? target.closest('[data-calendar-popup="end"]')
          : null;

      if (
        !clickedInsideRoot &&
        !clickedInsideStartPopup &&
        !clickedInsideEndPopup
      ) {
        setOpenPanel(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenPanel(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (selectedStartDate) {
      setStartVisibleMonth(
        new Date(
          selectedStartDate.getFullYear(),
          selectedStartDate.getMonth(),
          1,
        ),
      );
    }
  }, [selectedStartDate]);

  useEffect(() => {
    if (selectedEndDate) {
      setEndVisibleMonth(
        new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), 1),
      );
      return;
    }

    if (selectedStartDate) {
      setEndVisibleMonth(
        new Date(
          selectedStartDate.getFullYear(),
          selectedStartDate.getMonth(),
          1,
        ),
      );
    }
  }, [selectedEndDate, selectedStartDate]);

  useEffect(() => {
    if (openPanel) {
      updatePopupPositions();
    }
  }, [openPanel, startVisibleMonth, endVisibleMonth]);

  const startMonthMin = new Date(
    absoluteMinDate.getFullYear(),
    absoluteMinDate.getMonth(),
    1,
  );

  const endMinAllowedDate = selectedStartDate ?? absoluteMinDate;
  const endMonthMin = new Date(
    endMinAllowedDate.getFullYear(),
    endMinAllowedDate.getMonth(),
    1,
  );

  const canGoPrevStart = !isBeforeDay(
    addMonths(startVisibleMonth, -1),
    startMonthMin,
  );

  const canGoPrevEnd = !isBeforeDay(
    addMonths(endVisibleMonth, -1),
    endMonthMin,
  );

  function handleOpenStart() {
    updatePopupPositions();

    if (selectedStartDate) {
      setStartVisibleMonth(
        new Date(
          selectedStartDate.getFullYear(),
          selectedStartDate.getMonth(),
          1,
        ),
      );
    }

    setOpenPanel('start');
  }

  function handleOpenEnd() {
    updatePopupPositions();

    if (selectedEndDate) {
      setEndVisibleMonth(
        new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), 1),
      );
    } else if (selectedStartDate) {
      setEndVisibleMonth(
        new Date(
          selectedStartDate.getFullYear(),
          selectedStartDate.getMonth(),
          1,
        ),
      );
    }

    setOpenPanel('end');
  }

  function handleSelectStartDate(date: Date) {
    const iso = formatIsoDate(date);

    onChangeStartDate(iso);

    if (selectedEndDate && isBeforeDay(selectedEndDate, date)) {
      onChangeEndDate('');
    }

    setEndVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    updatePopupPositions();
    setOpenPanel('end');
  }

  function handleSelectEndDate(date: Date) {
    if (selectedStartDate && isBeforeDay(date, selectedStartDate)) {
      return;
    }

    onChangeEndDate(formatIsoDate(date));
    setOpenPanel(null);
  }

  function handleClear() {
    onChangeStartDate('');
    onChangeEndDate('');
    setOpenPanel(null);
    setStartVisibleMonth(
      new Date(absoluteMinDate.getFullYear(), absoluteMinDate.getMonth(), 1),
    );
    setEndVisibleMonth(
      new Date(absoluteMinDate.getFullYear(), absoluteMinDate.getMonth(), 1),
    );
  }

  return (
    <div
      ref={rootRef}
      className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Период за наем
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Избери начална и крайна дата
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Първо избери начална дата, после крайна.
          </p>
        </div>

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Изчисти датите
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div ref={startTriggerRef}>
          <button
            type="button"
            onClick={handleOpenStart}
            className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
              openPanel === 'start'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Начална дата
            </span>
            <span className="mt-2 block text-base font-bold text-slate-900">
              {formatDisplayDate(startDate, 'Избери начална дата')}
            </span>
          </button>
        </div>

        <div ref={endTriggerRef}>
          <button
            type="button"
            onClick={handleOpenEnd}
            className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
              openPanel === 'end'
                ? 'border-blue-100 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Крайна дата
            </span>
            <span className="mt-2 block text-base font-bold text-slate-900">
              {formatDisplayDate(endDate, 'Избери крайна дата')}
            </span>
          </button>
        </div>
      </div>

      {isMounted && openPanel === 'start' && startPopupPosition && (
        <div data-calendar-popup="start">
          <CalendarPopup
            title="Начална дата"
            selectedDate={selectedStartDate}
            rangeStartDate={selectedStartDate}
            rangeEndDate={selectedEndDate}
            minAllowedDate={absoluteMinDate}
            visibleMonth={startVisibleMonth}
            onPrevMonth={() =>
              setStartVisibleMonth(addMonths(startVisibleMonth, -1))
            }
            onNextMonth={() =>
              setStartVisibleMonth(addMonths(startVisibleMonth, 1))
            }
            onSelectDate={handleSelectStartDate}
            canGoPrev={canGoPrevStart}
            position={startPopupPosition}
            popupType="start"
          />
        </div>
      )}

      {isMounted && openPanel === 'end' && endPopupPosition && (
        <div data-calendar-popup="end">
          <CalendarPopup
            title="Крайна дата"
            selectedDate={selectedEndDate}
            rangeStartDate={selectedStartDate}
            rangeEndDate={selectedEndDate}
            minAllowedDate={endMinAllowedDate}
            visibleMonth={endVisibleMonth}
            onPrevMonth={() =>
              setEndVisibleMonth(addMonths(endVisibleMonth, -1))
            }
            onNextMonth={() =>
              setEndVisibleMonth(addMonths(endVisibleMonth, 1))
            }
            onSelectDate={handleSelectEndDate}
            canGoPrev={canGoPrevEnd}
            position={endPopupPosition}
            popupType="end"
          />
        </div>
      )}
    </div>
  );
}
