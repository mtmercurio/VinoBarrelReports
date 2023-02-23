import {
  Container, Stack,
} from "@mui/material";
import * as React from "react";
import Button from "@mui/material/Button";
import {FormContainer, TextFieldElement} from "react-hook-form-mui";
import {BeverageUI, saveBeverage} from "../library/FirestoreUtils";
import {useLoaderData} from "react-router-dom";

export default function BeverageEdit() {
  const data = useLoaderData() as BeverageUI

  const onSubmit = async (data: BeverageUI) => {
    await saveBeverage(data)
  }

  return (
    <Container>
      <FormContainer
        defaultValues={data}
        onSuccess={onSubmit}
      >
        <Stack>
          <TextFieldElement name={`name`} label={'Name'} margin={'normal'} required/>
          <TextFieldElement name={`info`} label={'Info'} margin={'normal'} required/>
          <TextFieldElement name={`image`} label={'Image'} margin={'normal'} required/>
          <TextFieldElement name={`tastingNotes`} label={'Tasting Notes'} margin={'normal'} required/>
          <Button type={'submit'} color={'success'}>
            Save
          </Button>
        </Stack>
      </FormContainer>
    </Container>
  )
}