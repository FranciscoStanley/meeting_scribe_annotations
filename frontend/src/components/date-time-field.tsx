'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { startOfDay } from 'date-fns';
import {
  combineDateAndTime,
  formatDateTimeDisplay,
  timeFromDate,
} from '@/lib/datetime';
import 'react-day-picker/style.css';

type DateTimeFieldProps = {
  label: string;
  value: Date | null;
  onChange: (next: Date | null) => void;
  required?: boolean;
  optionalHint?: boolean;
  minDate?: Date;
  disabled?: boolean;
};

export function DateTimeField({
  label,
  value,
  onChange,
  required,
  optionalHint,
  minDate,
  disabled,
}: DateTimeFieldProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(timeFromDate(value));

  useEffect(() => {
    setTime(timeFromDate(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function applyDay(day: Date | undefined) {
    if (!day) {
      onChange(null);
      return;
    }
    onChange(combineDateAndTime(day, time));
  }

  function applyTime(next: string) {
    setTime(next);
    if (value) {
      onChange(combineDateAndTime(value, next));
    }
  }

  const display = formatDateTimeDisplay(value) || 'Selecionar data e hora';

  return (
    <div ref={rootRef} className="relative">
      <label className="ms-label" htmlFor={id}>
        {label}
        {optionalHint ? (
          <span className="font-normal text-muted"> (opcional)</span>
        ) : null}
      </label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="ms-input flex w-full items-center justify-between text-left font-normal"
      >
        <span className={value ? 'text-ink' : 'text-muted-soft'}>{display}</span>
        <svg
          className="h-4 w-4 shrink-0 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M3 9h18M8 3v4M16 3v4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {required ? (
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value={value ? value.toISOString() : ''}
          onChange={() => undefined}
          aria-hidden
        />
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="absolute z-30 mt-2 w-[min(100%,20rem)] rounded-2xl border border-hairline bg-panel p-3 shadow-lift"
        >
          <DayPicker
            mode="single"
            locale={ptBR}
            selected={value ?? undefined}
            onSelect={applyDay}
            disabled={minDate ? { before: startOfDay(minDate) } : undefined}
            defaultMonth={value ?? minDate ?? new Date()}
            className="ms-daypicker"
          />
          <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3">
            <label className="text-xs font-medium text-muted" htmlFor={`${id}-time`}>
              Horário
            </label>
            <input
              id={`${id}-time`}
              type="time"
              value={time}
              onChange={(e) => applyTime(e.target.value)}
              className="ms-input mt-0 flex-1 py-2"
            />
          </div>
          <div className="mt-2 flex justify-between gap-2">
            {!required ? (
              <button
                type="button"
                className="ms-btn ms-btn-sm ms-btn-ghost"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Limpar
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="ms-btn ms-btn-sm ms-btn-primary"
              onClick={() => setOpen(false)}
            >
              Confirmar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
