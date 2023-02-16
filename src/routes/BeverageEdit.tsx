import {
  CircularProgress,
  Container, Stack,
} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {FormContainer, TextFieldElement} from "react-hook-form-mui";
import {BeverageUI, getBeverage, saveBeverage} from "../library/FirestoreUtils";

export default function BeverageEdit() {
  const {beverageId} = useParams<{ beverageId: string }>();
  const [beverage, setBeverage] = useState<BeverageUI>({
    id: '',
    name: 'New BeverageUI',
    info: '',
    image: '',
    tastingNotes: ''
  })
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: BeverageUI) => {
    await saveBeverage(data)
  }

  useEffect(() => {
    if (beverageId != null) {
      setIsLoading(true);
      getBeverage(beverageId)
        .then((beverage) => {
          if (beverage) {
            setBeverage(beverage)
          }
          setIsLoading(false);
        })
    }
  }, [beverageId])

  const defaultValues: BeverageUI = {
    id: beverage.id,
    name: beverage.name,
    info: beverage.info,
    image: beverage.image,
    tastingNotes: beverage.tastingNotes
  }

  return (
    <Container>
      {!isLoading &&
          <FormContainer
              defaultValues={defaultValues}
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
      }
      {isLoading &&
          <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pt: 4
          }}>
              <CircularProgress/>
          </Box>
      }
    </Container>
  )
}