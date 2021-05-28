import {
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { Formik, Form, ErrorMessage, FormikHelpers } from 'formik';
import { string, object } from 'yup';
import AlertMessage from './AlertMessage';
import IForm from './interfaces/IForm';
import IServerResponseData from './interfaces/IServerResponseData';
import AppContext from './AppContext';
import { useHistory, useParams } from 'react-router';
import IParams from './interfaces/IParams';

interface Props {
  setLoggedIn: Dispatch<SetStateAction<boolean | null>>;
}

const initialFormValues: IForm = {
  email: '',
  fullname: '',
  password: '',
  confirmPassword: '',
};

const defaultTextFieldProps: TextFieldProps = {
  autoComplete: 'off',
  variant: 'outlined',
  fullWidth: true,
  required: true,
  margin: 'normal',
};

const AuthenticationPage = ({ setLoggedIn }: Props) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [register, setRegister] = useState<boolean>(false);
  const [forgotPassword, setForgotPassword] = useState<boolean>(false);
  const resetPassword = useParams<IParams>();
  const history = useHistory();
  const isResetPassword = useMemo(
    () => Object.keys(resetPassword).length !== 0,
    [resetPassword]
  );
  const { setDocuments, setUserID, setAlertSettings, alertSettings } =
    useContext(AppContext);
  const matches = useMediaQuery<boolean>('(max-width:380px)');
  const emailRef = useRef<HTMLInputElement>(null);

  const validationSchema = useMemo(
    () =>
      object({
        email: !isResetPassword
          ? string()
              .trim()
              .email('Must be a valid email')
              .required('This field is required')
          : string(),
        fullname:
          register && !forgotPassword
            ? string()
                .trim()
                .min(5, 'Too short')
                .required('This field is required')
            : string(),
        password: !forgotPassword
          ? string()
              .trim()
              .min(5, 'Password must be at least 5 characters')
              .required('This field is required')
          : string(),
        confirmPassword:
          (register && !forgotPassword) || isResetPassword
            ? string()
                .test(
                  'passwords-match',
                  'Passwords must match',
                  function (value) {
                    return this.parent.password === value;
                  }
                )
                .required('This field is required')
            : string(),
      }),
    [register, forgotPassword, isResetPassword]
  );

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchToRegister = () => {
    setRegister(!register);
    setShowPassword(false);
  };

  return (
    <Container style={{ height: '100vh' }}>
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='100%'
        flexDirection='column'
      >
        <Box pb={matches ? 4 : 10}>
          <Typography
            component='h1'
            variant='h4'
            style={{ textAlign: 'center' }}
          >
            Online Text Editor
          </Typography>
        </Box>
        <Typography component='h1' variant='h5'>
          {isResetPassword
            ? 'Reset password'
            : forgotPassword
            ? 'Forgot password'
            : !register
            ? 'Sign in'
            : 'Create an account'}
        </Typography>
        <Formik
          initialValues={{ ...initialFormValues }}
          onSubmit={(
            values: IForm,
            { setSubmitting, resetForm }: FormikHelpers<IForm>
          ): void => {
            setAlertSettings({ ...alertSettings, showAlert: false });

            setTimeout(async () => {
              const data: IForm = isResetPassword
                ? { password: values.password }
                : forgotPassword
                ? { email: values.email }
                : register
                ? values
                : { email: values.email, password: values.password };
              const requestPath: string = isResetPassword
                ? `reset-password/${resetPassword.token}`
                : forgotPassword
                ? 'forgot-password'
                : register
                ? 'create'
                : 'login';
              try {
                const response: Response = await fetch(`/${requestPath}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                });

                const responseJSON: IServerResponseData = await response.json();
                if (responseJSON.success) {
                  if (requestPath === 'login') {
                    setUserID(responseJSON.data.userId);
                    setDocuments(responseJSON.data.documents);
                    setLoggedIn(true);
                  } else if (requestPath === 'create') {
                    setRegister(false);
                    setAlertSettings({
                      severityType: 'success',
                      alertMessage: responseJSON.message,
                      showAlert: true,
                    });
                    emailRef.current?.focus();
                    resetForm();
                  } else if (isResetPassword) {
                    history.push('/');
                    setAlertSettings({
                      severityType: 'success',
                      alertMessage: responseJSON.message,
                      showAlert: true,
                    });
                  } else {
                    setAlertSettings({
                      severityType: 'success',
                      alertMessage: responseJSON.message,
                      showAlert: true,
                    });
                    setRegister(false);
                    setForgotPassword(false);
                    resetForm();
                    emailRef.current?.focus();
                  }
                } else {
                  setAlertSettings({
                    severityType: 'error',
                    alertMessage: responseJSON.message,
                    showAlert: true,
                  });
                }
                setSubmitting(false);
              } catch (e) {
                setAlertSettings({
                  severityType: 'error',
                  alertMessage: 'Server error, please try again later',
                  showAlert: true,
                });
                setSubmitting(false);
              }
            }, 500);
          }}
          validationSchema={validationSchema}
        >
          {({
            values,
            errors,
            touched,
            isSubmitting,
            handleChange,
            handleReset,
          }) => (
            <Form
              noValidate
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Container
                style={{
                  minWidth: !matches ? '370px' : '',
                  maxWidth: '370px',
                  padding: '20px 0',
                }}
              >
                {!isResetPassword && (
                  <TextField
                    {...defaultTextFieldProps}
                    name='email'
                    label='Email'
                    autoFocus
                    inputRef={emailRef}
                    value={values.email}
                    onChange={handleChange}
                    error={touched.email && Boolean(errors.email)}
                    helperText={<ErrorMessage name='email' />}
                  />
                )}
                {!register || forgotPassword ? null : (
                  <TextField
                    {...defaultTextFieldProps}
                    name='fullname'
                    label='Full Name'
                    value={values.fullname}
                    onChange={handleChange}
                    error={touched.fullname && Boolean(errors.fullname)}
                    helperText={<ErrorMessage name='fullname' />}
                  />
                )}
                {!forgotPassword && (
                  <TextField
                    {...defaultTextFieldProps}
                    name='password'
                    label='Password'
                    type={!showPassword ? 'password' : 'text'}
                    value={values.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment:
                        register || isResetPassword ? null : (
                          <InputAdornment position='end'>
                            <IconButton onClick={handlePasswordVisibility}>
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                    }}
                    error={touched.password && Boolean(errors.password)}
                    helperText={<ErrorMessage name='password' />}
                  />
                )}
                {((register && !forgotPassword) || isResetPassword) && (
                  <TextField
                    {...defaultTextFieldProps}
                    name='confirmPassword'
                    type='password'
                    label='Confirm Password'
                    value={values.confirmPassword}
                    onChange={handleChange}
                    error={
                      touched.confirmPassword && Boolean(errors.confirmPassword)
                    }
                    helperText={<ErrorMessage name='confirmPassword' />}
                  />
                )}

                {!isResetPassword && (
                  <Box
                    display='flex'
                    justifyContent={register ? 'flex-end' : 'space-between'}
                  >
                    {!register ? (
                      <Button
                        size='small'
                        onClick={() => {
                          handleReset();
                          setForgotPassword(true);
                          switchToRegister();
                          emailRef.current?.focus();
                        }}
                      >
                        Forgot password
                      </Button>
                    ) : null}
                    <Button
                      size='small'
                      onClick={() => {
                        handleReset();
                        switchToRegister();
                        setForgotPassword(false);
                        emailRef.current?.focus();
                      }}
                    >
                      {register ? 'Sign in' : 'Create an account'}
                    </Button>
                  </Box>
                )}
              </Container>
              <Button
                disabled={isSubmitting}
                type='submit'
                variant='contained'
                color='primary'
              >
                Confirm
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
      <AlertMessage
        alertSettings={alertSettings}
        setAlertSettings={setAlertSettings}
      />
    </Container>
  );
};

export default AuthenticationPage;
