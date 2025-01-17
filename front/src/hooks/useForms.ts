import {useEffect, useState} from 'react';

interface useFormProps<T> {
  initialValue: T;
  validate: (values: T) => Record<keyof T, string>;
}

function useForm<T>({initialValue, validate}: useFormProps<T>) {
  const [values, setValues] = useState(initialValue);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChangeText = (name: keyof T, text: string) => {
    // 값을 숫자로 변환해야 한다면, 필요한 경우 이 부분을 수정할 수 있습니다.
    const parsedValue = isNaN(Number(text)) ? text : Number(text);

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
  };

  function getTextInputProps(name: keyof T) {
    const value = values[name];
    const onChangeText = (text: string) => handleChangeText(name, text);
    const onBlur = () => handleBlur(name);

    return {value: String(value), onChangeText};
  }
  useEffect(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [validate, values]);

  const isFormValid = Object.values(errors).every(error => error === '');

  return {values, isFormValid, getTextInputProps};
}

export default useForm;
