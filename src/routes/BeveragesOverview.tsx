import Grid from "@mui/material/Unstable_Grid2";
import {
  Button,
  Card,
  CardContent,
  Container, Dialog, DialogActions, DialogTitle,
  IconButton,
} from "@mui/material";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Box from "@mui/material/Box";
import AddIcon from '@mui/icons-material/Add';
import {Firestore} from "@firebase/firestore";
import {collection, doc, getDocs, query, deleteDoc, addDoc} from "firebase/firestore";
import BeverageCard from "../comonents/BeverageCard";

export type Beverage = {
  id?: string;
  name: string;
  info: string;
  image: string;
  tastingNotes: string;
}

export default function BeveragesOverview(props: { db: Firestore }) {
  const navigate = useNavigate();
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [beverageToDelete, setBeverageToDelete] = useState<Beverage>();
  const [showDeleteBeverageConfirm, setShowDeleteBeverageConfirm] = useState(false);

  const getBeverages = useCallback(async () => {
    const q = query(collection(props.db, "beverages"));
    const querySnapshot = await getDocs(q);
    const beverages: Beverage[] = []
    querySnapshot.forEach((doc) => {
      beverages.push({...doc.data() as Beverage, id: doc.id})
    });
    setBeverages(beverages)
  }, [props.db])

  useEffect(() => {
    getBeverages().then()
  }, [getBeverages])

  const handleCloseBeverageDeleteConfirm = () => {
    setShowDeleteBeverageConfirm(false);
  }

  const deleteBeverage = async () => {
    if (beverageToDelete?.id) {
      await deleteDoc(doc(props.db, "beverages", beverageToDelete.id));
    }
  }

  const handleDeleteBeverageClick = () => {
    deleteBeverage().then(() => {
      setShowDeleteBeverageConfirm(false)
      getBeverages().then()
    })
  }

  const handleAddBeverageClick = async () => {
    const newBeverage: Beverage = {
      name: '',
      info: '',
      image: '',
      tastingNotes: '',
    }
    const docRef = await addDoc(collection(props.db, "beverages"), newBeverage);
    navigate(`/beverage/${docRef.id}`)
  }

  const onCardDeleteButtonClick = useCallback((beverage: Beverage) => {
    setBeverageToDelete(beverage)
    setShowDeleteBeverageConfirm(true)
  }, [])

  return (
    <Container>
      <Grid container spacing={3}>
        {beverages.map((beverage) =>
          <Grid key={beverage.id} xs={12} sm={12} md={6}>
            <BeverageCard beverage={beverage} onDeleteButtonClick={onCardDeleteButtonClick}/>
          </Grid>
        )}
        <Grid xs={12} sm={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box textAlign='center'>
                <IconButton aria-label="add" size="large"
                            sx={{fontSize: 200}}
                            onClick={handleAddBeverageClick}>
                  <AddIcon fontSize="inherit"/>
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={showDeleteBeverageConfirm}
        onClose={handleCloseBeverageDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete beverage {beverageToDelete?.name}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseBeverageDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteBeverageClick} color={'error'}>Delete Beverage</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
