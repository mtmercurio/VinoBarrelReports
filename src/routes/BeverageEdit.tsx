import {
  CircularProgress,
  Container, Stack,
} from "@mui/material";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import {Beverage} from "./BeveragesOverview";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {Firestore} from "@firebase/firestore";
import Button from "@mui/material/Button";
import {FormContainer, TextFieldElement} from "react-hook-form-mui";

export default function BeverageEdit(props: { db: Firestore }) {
  const navigate = useNavigate();
  const {beverageId} = useParams<{ beverageId: string }>();
  const [beverage, setBeverage] = useState<Beverage>({
    id: '',
    name: 'New Beverage',
    info: '',
    image: '',
    tastingNotes: '',
  })
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: Beverage) => {
    saveBeverage(data).then()
  }

  const getBeverage = useCallback(async (beverageId: string) => {
    const docRef = doc(props.db, "beverages", beverageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      const b = {...docSnap.data(), id: docSnap.id}
      setBeverage(b as Beverage)
    } else {
      console.log("No such document!");
    }
  }, [props.db])

  useEffect(() => {
    if (beverageId != null) {
      setIsLoading(true);
      getBeverage(beverageId)
        .then(() => {
          setIsLoading(false);
        })
    }
  }, [getBeverage, beverageId])

  const saveBeverage = async (data: Beverage) => {
    if (beverageId != null) {
      await setDoc(doc(props.db, "beverages", beverageId), data, {merge: true});
    }
    navigate('/beverages')
  }

  const defaultValues: Beverage = {
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