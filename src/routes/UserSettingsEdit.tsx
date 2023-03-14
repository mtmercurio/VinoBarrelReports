import {
  Container, Stack, Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { saveUserSettings } from "../library/FirebaseUtils";
import { useLoaderData } from "react-router-dom";

type Contact = {
  name: string;
  phoneNumber: number;
}

export type UserSettings = {
  passcode: number;
  contacts: Contact[];
}

export default function UserSettingsEdit() {
  const data = useLoaderData() as UserSettings

  const onSubmit = async (data: UserSettings) => {
    await saveUserSettings(data)
  }

  return (
    <Container>
      <FormContainer
        defaultValues={data}
        onSuccess={onSubmit}
      >
        <Stack>
          <TextFieldElement
            margin={'normal'}
            label={'Passcode'}
            required
            name={'passcode'}
            type={'number'}
            helperText={"A unique number that will be shared among the staff"}
          />
          <br />
          <Typography variant="h6">
            Contacts
          </Typography>
          <TextFieldElement name={`contacts[0].name`} label={'Name'} margin={'normal'} />
          <TextFieldElement name={`contacts[0].phoneNumber`} label={'Phone Number'} margin={'normal'} type={'number'} helperText={"Digits only, no dashes or parenthesis"} />
          <br />
          <TextFieldElement name={`contacts[1].name`} label={'Name'} margin={'normal'} />
          <TextFieldElement name={`contacts[1].phoneNumber`} label={'Phone Number'} margin={'normal'} type={'number'} helperText={"Digits only, no dashes or parenthesis"} />
          <br />
          <TextFieldElement name={`contacts[2].name`} label={'Name'} margin={'normal'} />
          <TextFieldElement name={`contacts[2].phoneNumber`} label={'Phone Number'} margin={'normal'} type={'number'} helperText={"Digits only, no dashes or parenthesis"} />
          <br />
          <Button type={'submit'} color={'success'}>
            Save
          </Button>
        </Stack>
      </FormContainer>
    </Container>
  )
}