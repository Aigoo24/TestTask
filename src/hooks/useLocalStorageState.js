import { useEffect, useState } from "react";

const getInitialValue = (key, initialValue) => {
  try {
    const savedValue = localStorage.getItem(key);

    if (savedValue === null) {
      return initialValue;
    }

    return JSON.parse(savedValue);
  } catch (error) {
    console.error(
      `Ошибка чтения localStorage для ключа "${key}"`,
      error
    );

    return initialValue;
  }
};

const useLocalStorageState = (key, initialValue) => {
  const [value, setValue] = useState(() =>
    getInitialValue(key, initialValue)
  );

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(
        `Ошибка записи localStorage для ключа "${key}"`,
        error
      );
    }
  }, [key, value]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== key) {
        return;
      }

      try {
        const newValue =
          event.newValue === null
            ? initialValue
            : JSON.parse(event.newValue);

        setValue(newValue);
      } catch (error) {
        console.error(
          `Ошибка синхронизации localStorage для ключа "${key}"`,
          error
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [key, initialValue]);

  return [value, setValue];
};

export default useLocalStorageState;