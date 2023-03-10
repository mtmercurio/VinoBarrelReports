import Grid from "@mui/material/Unstable_Grid2";
import {
  Button,
  Card,
  CardContent,
  Container, Dialog, DialogActions, DialogTitle,
  IconButton,
} from "@mui/material";
import {useCallback, useState} from "react";
import {useLoaderData, useNavigate} from "react-router-dom";
import Box from "@mui/material/Box";
import AddIcon from '@mui/icons-material/Add';
import BeverageCard from "../comonents/BeverageCard";
import {BeverageUI, deleteBeverage, getBeverages, saveBeverage} from "../library/FirebaseUtils";

export default function BeveragesOverview() {
  const navigate = useNavigate();
  const data = useLoaderData() as BeverageUI[]
  const [beverages, setBeverages] = useState<BeverageUI[]>(data);
  const [beverageToDelete, setBeverageToDelete] = useState<BeverageUI>();
  const [showDeleteBeverageConfirm, setShowDeleteBeverageConfirm] = useState(false);

  const handleCloseBeverageDeleteConfirm = () => {
    setShowDeleteBeverageConfirm(false);
  }

  const handleDeleteBeverageClick = () => {
    if (beverageToDelete?.id) {
      deleteBeverage(beverageToDelete.id).then(() => {
        setShowDeleteBeverageConfirm(false)
        getBeverages().then((beverages) => setBeverages(beverages))
      })
    }
  }

  const handleAddBeverageClick = async () => {
    const id = await saveBeverage({
      name: '',
      info: '',
      image: '',
      tastingNotes: '',
    })
    navigate(`/beverages/${id}`)
  }

  const onCardDeleteButtonClick = useCallback((beverage: BeverageUI) => {
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
