import {Alert, Container, Stack} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {FormContainer, PasswordElement, TextFieldElement} from "react-hook-form-mui";
import {sendPasswordReset, signIn} from "../library/FirebaseUtils";
import {NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";
import Box from "@mui/material/Box";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState()
  const [successMessage, setSuccessMessage] = useState()

  const onSubmit = async (data: { email: string, password: string }) => {
    const signedIn = await signIn(data.email, data.password)
    if (signedIn.ok) {
      navigate('/')
    } else {
      setErrorMessage(signedIn.message.replace('_', ' '))
    }
  }

  const handleForgotPasswordClick = async () => {
    const passwordReset = await sendPasswordReset(email)
    if (passwordReset.ok) {
      setSuccessMessage(passwordReset.message)
    } else {
      setErrorMessage(passwordReset.message.replace('_', ' '))
    }
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  return (
    <>
      <AppBar position="static" color={'inherit'}>
        <Container>
          <Toolbar disableGutters>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                flexGrow: 1,
                mr: 2,
                display: 'flex',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Vino<span className={'bold'}>Barrel</span>
            </Typography>
            <NavLink
              style={{
                textDecoration: "none",
              }}
              to={'/signup'}
            >
              <Button variant="text"
                      sx={{color: 'black', display: 'block'}}
              >
                Sign Up
              </Button>
            </NavLink>
          </Toolbar>
        </Container>
      </AppBar>
      <Container>
        <FormContainer
          onSuccess={onSubmit}
        >
          <Stack spacing={2}>
            <TextFieldElement
              required
              type={'email'}
              margin={'normal'}
              label={'Email'}
              name={'email'}
              autoComplete="email"
              onChange={handleEmailChange}
            />
            <PasswordElement
              margin={'normal'}
              label={'Password'}
              required
              name={'password'}
              autoComplete="password"
            />
            <Box sx={{width: 'fit-content', cursor: 'pointer'}} color={'info'} onClick={handleForgotPasswordClick}>
              Reset Password
            </Box>
            {successMessage &&
                <Alert severity="success">{successMessage}</Alert>
            }
            {errorMessage &&
                <Alert severity="error">{errorMessage}</Alert>
            }
            <Button type={'submit'} color={'success'} size={'large'}>
              Submit
            </Button>
          </Stack>
        </FormContainer>
      </Container>
    </>
  )
}