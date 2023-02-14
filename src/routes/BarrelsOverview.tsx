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
import {collection, doc, getDocs, query, deleteDoc, addDoc, getDoc} from "firebase/firestore";
import {Beverage} from "./BeveragesOverview";
import {DocumentReference} from '@firebase/firestore-types';

export type Keg = {
  id: string;
  beverageRef?: DocumentReference;
  beverage?: Beverage;
  ounces: number;
  smallPrice: number;
  smallOunces: number;
  fullPrice: number;
  fullOunces: number;
}

export type Barrel = {
  id?: string;
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

    querySnapshot.forEach((barrelDoc) => {
      const barrel = {...(barrelDoc.data() as Barrel), id: barrelDoc.id}
      barrels.push(barrel)
    });
    return [...barrels]
  }, [props.db])

  const getKegs = useCallback(async (barrels: Barrel[]) => {
    const updatedBarrels = []
    for (const barrel of barrels) {
      const kegs: Keg[] = []
      const kegRefs = barrel.kegs;
      for (const keg of kegRefs) {
        if (keg?.beverageRef) {
          const docRef = doc(props.db, keg.beverageRef.path);
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            kegs.push({...keg, beverage: (docSnap.data() as Beverage)})
          } else {
            console.log("No such document!");
          }
        }
      }
      updatedBarrels.push({...barrel, kegs: kegs})
    }
    return updatedBarrels;
  }, [props.db]);

  useEffect(() => {
    getBarrels().then((barrels) => {
      getKegs(barrels).then(updatedBarrels => {
        console.log(updatedBarrels)
        setBarrels(updatedBarrels)
      })
    })
  }, [getBarrels, getKegs])

  const handleShowBarrelDeleteConfirm = (barrel: Barrel) => {
    setBarrelToDelete(barrel);
    setShowDeleteBarrelConfirm(true);
  }

  const handleCloseBarrelDeleteConfirm = () => {
    setShowDeleteBarrelConfirm(false);
  }

  const deleteBarrel = async () => {
    if (barrelToDelete?.id) {
      await deleteDoc(doc(props.db, "barrels", barrelToDelete.id));
    }
  }

  const handleDeleteBarrelClick = () => {
    deleteBarrel().then(() => {
      setShowDeleteBarrelConfirm(false)
      getBarrels().then()
    })
  }

  const handleAddBarrelClick = async () => {
    const newBarrel: Barrel = {
      name: '',
      temperature: 0.0,
      kegs: [
        {
          id: 'red',
          ounces: 25,
          smallPrice: 3.00,
          smallOunces: 1.5,
          fullPrice: 9.00,
          fullOunces: 9.00
        },
        {
          id: 'green',
          ounces: 25,
          smallPrice: 3.00,
          smallOunces: 1.5,
          fullPrice: 9.00,
          fullOunces: 9.00
        },
        {
          id: 'blue',
          ounces: 25,
          smallPrice: 3.00,
          smallOunces: 1.5,
          fullPrice: 9.00,
          fullOunces: 9.00
        },
      ]
    }
    const docRef = await addDoc(collection(props.db, "barrels"), newBarrel);
    navigate(`/barrel/${docRef.id}`)
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
                              sx={{color: keg.ounces < keg.fullOunces ? 'red' : 'inherit'}}
                              secondaryAction={
                                <Typography>
                                  {keg.ounces?.toFixed(2)} oz
                                </Typography>
                              }
                    >
                      <ListItemText primary={keg.beverage?.name}/>
                    </ListItem>
                  )
                  }
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
