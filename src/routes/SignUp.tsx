import {Alert, Container, Stack} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import * as React from "react";
import {FormContainer, PasswordElement, PasswordRepeatElement, TextFieldElement} from "react-hook-form-mui";
import {createUser} from "../library/FirebaseUtils";
import {NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";

export default function SignUp() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState()

  const onSubmit = async (data: { email: string, password: string }) => {
    const createdUser = await createUser(data.email, data.password)
    if (createdUser.ok) {
      navigate('/')
    } else {
      setErrorMessage(createdUser.message.replace('_', ' '))
    }
  }

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
              to={'/login'}
            >
              <Button variant="text"
                      sx={{color: 'black', display: 'block'}}
              >
                Login
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
            />
            <PasswordElement
              margin={'normal'}
              label={'Password'}
              required
              name={'password'}
              autoComplete="new-password"
            />
            <PasswordRepeatElement
              passwordFieldName={'password'}
              name={'password-repeat'}
              margin={'normal'}
              label={'Repeat Password'}
              required
            />
            {errorMessage &&
                <Alert severity="error">{errorMessage}</Alert>
            }
            <Button type={'submit'} color={'success'}>
              Submit
            </Button>
          </Stack>
        </FormContainer>
      </Container>
    </>
  )
}