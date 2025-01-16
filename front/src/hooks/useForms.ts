import {useEffect, useState} from 'react';

interface useFormProps<T> {
  initialValue: T;
  validate: (values: T) => Record<keyof T, string>;
}

function useForm<T>({initialValue, validate}: useFormProps<T>) {
  const [values, setValues] = useState(initialValue);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChangeText = (name: keyof T, text: string) => {
    setValues({
      ...values,
      [name]: text,
    });
  };

  function getTextInputProps(name: keyof T) {
    const value = values[name];
    const onChangeText = (text: string) => handleChangeText(name, text);

    return {value, onChangeText};
  }
  useEffect(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [values, validate]); // values가 변경될 때마다 validate 호출

  const isFormValid = Object.values(errors).every(error => error === '');

  return {values, isFormValid, getTextInputProps};
}

export default useForm;
