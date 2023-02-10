import Grid from "@mui/material/Unstable_Grid2";
import {
  Button,
  Card, CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Container, Dialog, DialogActions, DialogTitle,
  IconButton,
  ListItem,
  ListItemText
} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Box from "@mui/material/Box";
import AddIcon from '@mui/icons-material/Add';
import {Firestore} from "@firebase/firestore";
import {collection, doc, getDocs, query, deleteDoc} from "firebase/firestore";

export type Keg = {
  id: string;
  name: string;
  info: string;
  image: string;
  milliliters: number;
  tastingNotes: string;
  smallPrice: number;
  smallMilliliters: number;
  fullPrice: number;
  fullMilliliters: number;
}

export type Barrel = {
  id: string;
  name: string;
  temperature: number;
  kegs: Keg[];
}

export default function BarrelsOverview(props: { db: Firestore }) {
  const navigate = useNavigate();
  const [barrels, setBarrels] = useState<Barrel[]>([]);
  const [barrelToDelete, setBarrelToDelete] = useState<Barrel>();
  const [showDeleteBarrelConfirm, setShowDeleteBarrelConfirm] = useState(false);

  const getBarrels = useCallback(async () => {
    const q = query(collection(props.db, "barrels"));
    const querySnapshot = await getDocs(q);
    const barrels: Barrel[] = []
    querySnapshot.forEach((doc) => {
      barrels.push({...doc.data() as Barrel, id: doc.id})
    });
    setBarrels(barrels)
  }, [props.db])

  useEffect(() => {
    getBarrels().then()
  }, [getBarrels])

  const handleShowBarrelDeleteConfirm = (barrel: Barrel) => {
    setBarrelToDelete(barrel);
    setShowDeleteBarrelConfirm(true);
  }

  const handleCloseBarrelDeleteConfirm = () => {
    setShowDeleteBarrelConfirm(false);
  }

  const deleteBarrel = async () => {
    if (barrelToDelete) {
      await deleteDoc(doc(props.db, "barrels", barrelToDelete.id));
    }
  }

  const handleDeleteBarrelClick = () => {
    deleteBarrel().then(() => {
      setShowDeleteBarrelConfirm(false)
      getBarrels().then()
    })
  }

  const handleAddBarrelClick = () => {
    navigate(`/new`);
  }

  const millilitersToOunces = (milliliters: number): number => {
    return milliliters / 29.574
  }

  return (
    <Container>
      <Grid container spacing={3}>
        {barrels.map((barrel) =>
          <Grid key={barrel.id} xs={12} sm={12} md={6}>
            <Card
              sx={{height: 1, display: 'flex', justifyContent: 'space-between', flexDirection: 'column'}}>
              <CardActionArea onClick={() => navigate(`/edit/${barrel.id}`)}>
                <CardContent>
                  <CardHeader
                    title={`${barrel.name}`}
                    subheader={barrel?.temperature ? `${barrel.temperature.toFixed(1)} \u00B0F` : ``}
                  />

                  {barrel.kegs.map((keg, index) =>
                    <ListItem key={keg.id + index}
                              sx={{color: keg.milliliters < keg.fullMilliliters ? 'red' : 'inherit'}}
                              secondaryAction={
                                <Typography>
                                  {millilitersToOunces(keg.milliliters).toFixed(2)} oz
                                </Typography>
                              }
                    >
                      <ListItemText primary={keg.name}/>
                    </ListItem>
                  )}
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="large" color="error"
                        onClick={() => handleShowBarrelDeleteConfirm(barrel)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        )}
        <Grid xs={12} sm={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box textAlign='center'>
                <IconButton aria-label="add" size="large"
                            sx={{fontSize: 200}}
                            onClick={handleAddBarrelClick}>
                  <AddIcon fontSize="inherit"/>
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={showDeleteBarrelConfirm}
        onClose={handleCloseBarrelDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete barrel {barrelToDelete?.name}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseBarrelDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteBarrelClick} color={'error'}>Delete Barrel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
