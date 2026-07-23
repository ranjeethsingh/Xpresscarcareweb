"use client";

import { useRef } from "react";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
};

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Enter password",
  className = "",
  name = "xpress-password-no-autofill",
  disabled = false,
}: PasswordInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const maskedValue = "*".repeat(value.length);

  const setCaret = (position: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(position, position);
    });
  };

  const replaceSelection = (insertText: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;

    const nextValue = value.slice(0, start) + insertText + value.slice(end);

    onChange(nextValue);
    setCaret(start + insertText.length);
  };

  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent;
    const inputText = nativeEvent.data;

    if (!inputText) return;

    e.preventDefault();
    replaceSelection(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;

    if (e.key === "Backspace") {
      e.preventDefault();

      if (start !== end) {
        const nextValue = value.slice(0, start) + value.slice(end);
        onChange(nextValue);
        setCaret(start);
        return;
      }

      if (start > 0) {
        const nextValue = value.slice(0, start - 1) + value.slice(start);
        onChange(nextValue);
        setCaret(start - 1);
      }

      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();

      if (start !== end) {
        const nextValue = value.slice(0, start) + value.slice(end);
        onChange(nextValue);
        setCaret(start);
        return;
      }

      if (start < value.length) {
        const nextValue = value.slice(0, start) + value.slice(start + 1);
        onChange(nextValue);
        setCaret(start);
      }

      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    replaceSelection(pastedText);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={maskedValue}
      onChange={() => {
        // Actual password is handled manually in React state.
        // The visible input only shows stars.
      }}
      onBeforeInput={handleBeforeInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
      autoComplete="new-password"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      className={className}
    />
  );
}