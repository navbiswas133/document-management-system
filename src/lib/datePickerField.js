export function openDatePicker(input) {
  if (!input || input.disabled) {
    return;
  }

  input.focus({ preventScroll: true });

  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker();
    } catch {
      // showPicker may throw if already open or unsupported
    }
  }
}

export function handleDateFieldClick(event) {
  const input = event.currentTarget.querySelector('input[type="date"]');
  openDatePicker(input);
}
