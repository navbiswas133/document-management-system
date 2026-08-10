import { useEffect, useRef, useState } from 'react';
import styles from './CustomSelect.module.css';

const TONE_CLASS = {
  purple: styles.tone_purple,
  blue: styles.tone_blue,
  green: styles.tone_green,
};

function normalizeOptions(options) {
  return options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );
}

function CheckIcon() {
  return (
    <svg
      className={styles.optionCheck}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DropdownPanel({
  tone = 'default',
  className = '',
  children,
  id,
  'aria-label': ariaLabel,
  role = 'listbox',
}) {
  const toneClass = TONE_CLASS[tone] ?? '';

  return (
    <ul
      id={id}
      className={`${styles.panel} ${toneClass} ${className}`.trim()}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </ul>
  );
}

export function DropdownOption({
  children,
  selected = false,
  highlighted = false,
  onClick,
  disabled = false,
  role = 'option',
}) {
  const className = [
    styles.option,
    selected ? styles.optionSelected : '',
    highlighted ? styles.optionHighlighted : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li>
      <button
        type="button"
        className={className}
        role={role}
        aria-selected={selected}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        disabled={disabled}
      >
        <CheckIcon />
        <span className={styles.optionLabel}>{children}</span>
      </button>
    </li>
  );
}

export function DropdownEmpty({ children }) {
  return <li className={styles.empty}>{children}</li>;
}

export function CustomSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  emptyLabel,
  tone = 'default',
  disabled = false,
  error = false,
  comfortable = false,
  className = '',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const rootRef = useRef(null);

  const normalizedOptions = normalizeOptions(options);
  const listOptions = emptyLabel
    ? [{ value: '', label: emptyLabel }, ...normalizedOptions]
    : normalizedOptions;

  const selectedOption = listOptions.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder ?? 'Select…';
  const hasValue = value !== '' && value != null;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setHighlightIndex(-1);
    }
  }, [open]);

  function closeAndSelect(nextValue) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleTriggerKeyDown(event) {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        setHighlightIndex(0);
        return;
      }

      if (event.key === 'Enter' && highlightIndex >= 0) {
        closeAndSelect(listOptions[highlightIndex].value);
        return;
      }

      if (event.key === 'ArrowDown') {
        setHighlightIndex((index) => Math.min(index + 1, listOptions.length - 1));
      }

      if (event.key === 'ArrowUp') {
        setHighlightIndex((index) => Math.max(index - 1, 0));
      }
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const toneClass = TONE_CLASS[tone] ?? '';
  const rootClassName = [
    styles.root,
    toneClass,
    open ? styles.rootOpen : '',
    error ? styles.rootError : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClassName = [
    styles.trigger,
    comfortable ? styles.triggerComfortable : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={rootClassName}>
      <button
        type="button"
        id={id}
        className={triggerClassName}
        onClick={() => !disabled && setOpen((isOpen) => !isOpen)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
      >
        <span className={hasValue ? styles.triggerValue : styles.triggerPlaceholder}>
          {displayLabel}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <DropdownPanel tone={tone} id={`${id}-listbox`} aria-label={placeholder || 'Options'}>
          {listOptions.map((option, index) => (
            <DropdownOption
              key={option.value || '__empty__'}
              selected={option.value === value}
              highlighted={index === highlightIndex}
              disabled={disabled}
              onClick={() => closeAndSelect(option.value)}
            >
              {option.label}
            </DropdownOption>
          ))}
        </DropdownPanel>
      )}

      {name && <input type="hidden" name={name} value={value ?? ''} readOnly />}
    </div>
  );
}
