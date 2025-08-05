import {useEffect, useState} from 'react';

interface useFormProps<T> {
  initialValue: T;
  validate: (values: T) => Record<keyof T, string>;
}

function useForm<T>({initialValue, validate}: useFormProps<T>) {
  const [values, setValues] = useState(initialValue);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<Record<string, boolean>>({});

  const handleChangeText = (name: keyof T, text: string) => {
    setValues({
      ...values,
      [name]: text,
    });
  };

  const handleBlur = (name: keyof T) => {
    setTouched({
      ...touched,
      [name]: true,
    });
    setFocused({
      ...focused,
      [name]: false,
    });
  };

  const handleFocus = (name: keyof T) => {
    setFocused({
      ...focused,
      [name]: true,
    });
  };

  function getTextInputProps(name: keyof T) {
    const value = values[name];
    const onChangeText = (text: string) => {
      const processedText = name === 'codemessage' ? text.toUpperCase() : text;
      handleChangeText(name, processedText);
    };
    const onBlur = () => handleBlur(name);
    const onFocus = () => handleFocus(name);

    return {value: String(value), onChangeText, onBlur, onFocus};
  }
  useEffect(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [validate, values]);

  const isFormValid = Object.values(errors).every(error => error === '');

  return {
    values,
    errors,
    touched,
    focused,
    isFormValid,
    getTextInputProps,
    setValues,
  };
}

export default useForm;
