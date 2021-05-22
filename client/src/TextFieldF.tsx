import { TextField, TextFieldProps } from '@material-ui/core';
import { useField } from 'formik';

interface Props {
  name: string;
}

const TextFieldF = ({ name, ...otherProps }: Props) => {
  const [field, metadata] = useField(name);

  const configTextField: TextFieldProps = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: 'outlined',
  };

  if (metadata && metadata.touched && metadata.error) {
    configTextField.error = true;
    configTextField.helperText = metadata.error;
  }

  return <TextField {...configTextField} />;
};

export default TextFieldF;
