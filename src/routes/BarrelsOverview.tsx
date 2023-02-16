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
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Box from "@mui/material/Box";
import AddIcon from '@mui/icons-material/Add';
import {
  BarrelUI,
  deleteBarrel,
  getBarrels,
  saveBarrel
} from "../library/FirestoreUtils";

export default function BarrelsOverview() {
  const navigate = useNavigate();
  const [barrels, setBarrels] = useState<BarrelUI[]>([]);
  const [barrelToDelete, setBarrelToDelete] = useState<BarrelUI>();
  const [showDeleteBarrelConfirm, setShowDeleteBarrelConfirm] = useState(false);

  useEffect(() => {
    getBarrels()
      .then((barrels) => {
        setBarrels(barrels)
      })
  }, [])

  const handleShowBarrelDeleteConfirm = (barrel: BarrelUI) => {
    setBarrelToDelete(barrel);
    setShowDeleteBarrelConfirm(true);
  }

  const handleCloseBarrelDeleteConfirm = () => {
    setShowDeleteBarrelConfirm(false);
  }

  const handleDeleteBarrelClick = () => {
    if (barrelToDelete?.id) {
      deleteBarrel(barrelToDelete.id).then(() => {
        setShowDeleteBarrelConfirm(false)
        getBarrels().then()
      })
    }
  }

  const handleAddBarrelClick = async () => {
    const id = await saveBarrel({
      name: '',
      temperature: 0.0,
      kegs: [
        {
          id: 'red',
          ounces: 25,
          smallPrice: 3.00,
          smallOunces: 1.5,
          fullPrice: 9.00,
          fullOunces: 9.00,
        },
        {
          id: 'green',
          ounces: 25,
          smallPrice: 3.00,
          smallOunces: 1.5,
          fullPrice: 9.00,
          fullOunces: 9.00,
        },
        {
          id: 'blue',
          ounces: 25,
          smallPrice: 3.00,
          smallOunces: 1.5,
          fullPrice: 9.00,
          fullOunces: 9.00,
        },
      ]
    })
    navigate(`/barrel/${id}`)
  }

  return (
    <Container>
      <Grid container spacing={3}>
        {barrels.map((barrel) =>
          <Grid key={barrel.id} xs={12} sm={12} md={6}>
            <Card
              sx={{height: 1, display: 'flex', justifyContent: 'space-between', flexDirection: 'column'}}>
              <CardActionArea onClick={() => navigate(`/barrel/${barrel.id}`)}>
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
