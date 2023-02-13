import {
  CircularProgress,
  Container, Dialog, DialogActions, DialogTitle, Fab, InputAdornment,
  MenuItem, Stack, SxProps,
  Tab, Tabs, Zoom
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import {Barrel, Keg} from "./BarrelsOverview";
import {doc, getDoc, setDoc, addDoc, collection} from "firebase/firestore";
import {Firestore} from "@firebase/firestore";
import {green} from "@mui/material/colors";
import {useTheme} from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import './BarrelEdit.css'
import SaveIcon from '@mui/icons-material/Save';
import Button from "@mui/material/Button";

const kegIds = ['red', 'green', 'blue'] as const;
const defaultKeg: Keg = {
  id: 'red',
  name: 'New Keg',
  info: '',
  image: '',
  ounces: 0,
  tastingNotes: '',
  smallPrice: 0,
  fullPrice: 0,
  smallOunces: 0,
  fullOunces: 0,
}

export default function BarrelEdit(props: { db: Firestore }) {
  const {barrelId} = useParams<{ barrelId: string }>();
  const theme = useTheme();
  const [barrel, setBarrel] = useState<Barrel>({
    id: '',
    name: "",
    temperature: 0,
    kegs: [defaultKeg]
  })
  const [isLoading, setIsLoading] = useState(false);
  const [kegIndex, setKegIndex] = useState(0);
  const [hasChanged, setHasChanged] = useState(false)
  const [showDeleteKegConfirm, setShowDeleteKegConfirm] = useState(false);

  const getBarrel = useCallback(async (barrelId: string) => {
    const docRef = doc(props.db, "barrels", barrelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setBarrel(docSnap.data() as Barrel)
    } else {
      console.log("No such document!");
    }
  }, [props.db])

  useEffect(() => {
    if (barrelId) {
      setIsLoading(true);
      getBarrel(barrelId)
        .then(() => {
          setIsLoading(false);
        })
    }
  }, [getBarrel, barrelId])

  const saveBarrel = async () => {
    if (barrelId) {
      await setDoc(doc(props.db, "barrels", barrelId), barrel);
    } else {
      await addDoc(collection(props.db, "barrels"), barrel);
    }
    setHasChanged(false)
  }

  const handleShowKegDeleteConfirm = () => {
    setShowDeleteKegConfirm(true);
  }

  const handleCloseKegDeleteConfirm = () => {
    setShowDeleteKegConfirm(false);
  }

  const handleDeleteKegClick = () => {
    setBarrel(barrel => {
      barrel.kegs.splice(kegIndex, 1)
      return {...barrel}
    })
    setKegIndex(0)
    setShowDeleteKegConfirm(false)
    saveBarrel().then()
  }

  const handleBarrelNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanged(true)
    setBarrel(barrel => {
      return {...barrel, name: event.target.value}
    })
  }

  const handleIdSelect = async (kegId: typeof kegIds[number],) => {
    setHasChanged(true)
    setBarrel(barrel => {
      barrel.kegs[kegIndex].id = kegId
      return {...barrel}
    })
  }

  const handleNameChange = (name: string) => {
    setHasChanged(true)
    setBarrel(barrel => {
      barrel.kegs[kegIndex].name = name
      return {...barrel}
    })
  }

  const handleInfoChange = (info: string) => {
    setHasChanged(true)
    setBarrel(barrel => {
      barrel.kegs[kegIndex].info = info
      return {...barrel}
    })
  }

  const handleImageChange = (image: string) => {
    setHasChanged(true)
    setBarrel(barrel => {
      barrel.kegs[kegIndex].image = image
      return {...barrel}
    })
  }

  const handleOuncesChange = (ounces: string) => {
    setHasChanged(true)
    if (!isNaN(Number(ounces))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].ounces = parseInt(ounces)
        return {...barrel}
      })
    }
  }

  const handleTastingNotesChange = (tastingNotes: string) => {
    setHasChanged(true)
    setBarrel(barrel => {
      barrel.kegs[kegIndex].tastingNotes = tastingNotes
      return {...barrel}
    })
  }

  const handleSmallPriceChange = (smallPrice: string) => {
    setHasChanged(true)
    if (!isNaN(Number(smallPrice))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].smallPrice = parseInt(smallPrice)
        return {...barrel}
      })
    }
  }

  const handleSmallOuncesChange = (smallOunces: string) => {
    setHasChanged(true)
    if (!isNaN(Number(smallOunces))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].smallOunces = parseInt(smallOunces)
        return {...barrel}
      })
    }
  }

  const handleFullPriceChange = (fullPrice: string) => {
    setHasChanged(true)
    if (!isNaN(Number(fullPrice))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].fullPrice = parseInt(fullPrice)
        return {...barrel}
      })
    }
  }

  const handleFullOuncesChange = (fullOunces: string) => {
    setHasChanged(true)
    if (!isNaN(Number(fullOunces))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].fullOunces = parseInt(fullOunces)
        return {...barrel}
      })
    }
  }

  const handleAddKegClick = () => {
    setBarrel(barrel => {
      barrel.kegs.push(defaultKeg)
      setKegIndex(barrel.kegs.length - 1)
      return {...barrel}
    })
    saveBarrel().then()
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setKegIndex(newValue);
  };

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const buttonStyle = {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    },
  };

  const fabStyle = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    },
  };

  const fabGreenStyle = {
    color: 'common.white',
    bgcolor: green[500],
    '&:hover': {
      bgcolor: green[600],
    },
  };

  const fabs = [
    {
      color: 'primary' as 'primary',
      sx: fabStyle as SxProps,
      icon: <AddIcon/>,
      label: 'Keg',
      shouldShow: !hasChanged,
      handleOnClick: () => {
        handleAddKegClick()
      }
    },
    {
      color: 'inherit' as 'inherit',
      sx: {...fabStyle, ...fabGreenStyle} as SxProps,
      icon: <SaveIcon/>,
      label: 'Save',
      shouldShow: hasChanged,
      handleOnClick: () => {
        saveBarrel().then()
      }
    },
  ];

  return (
    <Container
      component="form"
      noValidate
      autoComplete="off"
    >
      {!isLoading &&
          <>
              <Stack spacing={2} direction="row" sx={{mb: 3}}>
                  <TextField id={`barrelName`} name={`barrelName`} label={'Barrel Name'} sx={{mr: 5}}
                             value={barrel?.name} onChange={handleBarrelNameChange} placeholder={'Barrel Name'}
                             inputProps={{maxLength: 45}}/>
                {fabs.map((fab) => (
                  <Zoom
                    key={fab.color}
                    in={fab.shouldShow}
                    timeout={transitionDuration}
                    style={{
                      transitionDelay: `${fab.shouldShow ? transitionDuration.exit : 0}ms`,
                    }}
                    unmountOnExit
                  >
                    <Fab sx={fab.sx} variant="extended" aria-label={fab.label} color={fab.color}
                         onClick={fab.handleOnClick}>
                      {fab.icon}
                    </Fab>
                  </Zoom>
                ))}
                  <Button variant={'outlined'} color={'primary'} onClick={handleAddKegClick}
                          sx={buttonStyle as SxProps}>
                      Add Keg
                  </Button>
                  <Button variant={'outlined'} color={'success'} disabled={!hasChanged} onClick={saveBarrel}
                          sx={buttonStyle as SxProps}>
                      Save
                  </Button>
              </Stack>
              <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                  <Tabs value={kegIndex} variant="scrollable" scrollButtons="auto" onChange={handleTabChange}
                        aria-label="keg tabs">
                    {barrel.kegs.map((keg, index) =>
                      <Tab key={index} label={keg.name}/>
                    )}
                  </Tabs>
              </Box>
              <Grid container spacing={2} sx={{mb: 8}}>
                  <Grid xs={12} sm={6}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-name`} name={`${barrel.kegs[kegIndex].id}KegName`}
                                 label={'Name'}
                                 value={barrel.kegs[kegIndex].name}
                                 onChange={(event) => handleNameChange(event.target.value)}
                                 placeholder={'Name'} inputProps={{maxLength: 50}} fullWidth/>
                  </Grid>
                  <Grid xs={6} sm={2}>
                      <TextField
                          id={`${barrel.kegs[kegIndex].id}-select-id`}
                          select
                          label="Keg ID"
                          value={barrel.kegs[kegIndex].id}
                          fullWidth
                      >
                        {kegIds.map((kegId) => (
                          <MenuItem key={kegId} value={kegId} onClick={() => handleIdSelect(kegId)}>
                            {kegId}
                          </MenuItem>
                        ))}
                      </TextField>
                  </Grid>
                  <Grid xs={6} sm={2}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-ounces`}
                                 name={`${barrel.kegs[kegIndex].id}KegOunces`}
                                 label={'Total Amount in Keg'}
                                 value={barrel.kegs[kegIndex].ounces}
                                 onChange={(event) => handleOuncesChange(event.target.value)}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">oz</InputAdornment>,
                                 }}
                                 placeholder={'750'} inputProps={{maxLength: 100}} fullWidth/>
                  </Grid>
                  <Grid xs={12} sm={6}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-info`} name={`${barrel.kegs[kegIndex].id}KegInfo`}
                                 label={'Info'}
                                 value={barrel.kegs[kegIndex].info}
                                 onChange={(event) => handleInfoChange(event.target.value)}
                                 placeholder={'Info'} inputProps={{maxLength: 100}} fullWidth/>
                  </Grid>
                  <Grid xs={12} sm={6}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-image`}
                                 name={`${barrel.kegs[kegIndex].id}KegImage`}
                                 label={'Image'}
                                 value={barrel.kegs[kegIndex].image}
                                 onChange={(event) => handleImageChange(event.target.value)}
                                 placeholder={'Image'} inputProps={{maxLength: 100}} fullWidth/>
                  </Grid>
                  <Grid xs={12}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-tasting-notes`}
                                 name={`${barrel.kegs[kegIndex].id}KegTastingNotes`}
                                 label={'Tasting Notes'}
                                 value={barrel.kegs[kegIndex].tastingNotes}
                                 onChange={(event) => handleTastingNotesChange(event.target.value)}
                                 placeholder={'Tasting Notes'} multiline={true} inputProps={{maxLength: 300}}
                                 fullWidth/>
                  </Grid>
                  <Grid xs={6} sm={2}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-small-price`}
                                 name={`${barrel.kegs[kegIndex].id}KegSmallPrice`}
                                 label={'Small Price'}
                                 value={barrel.kegs[kegIndex].smallPrice}
                                 onChange={(event) => handleSmallPriceChange(event.target.value)}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">&#162;</InputAdornment>,
                                 }}
                                 placeholder={'300'} inputProps={{maxLength: 6}} fullWidth/>
                  </Grid>
                  <Grid xs={6} sm={2}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-small-ounces`}
                                 name={`${barrel.kegs[kegIndex].id}KegSmallOunces`}
                                 label={'Small Pour Amount'}
                                 value={barrel.kegs[kegIndex].smallOunces}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">oz</InputAdornment>,
                                 }}
                                 onChange={(event) => handleSmallOuncesChange(event.target.value)}
                                 placeholder={'1.0'} inputProps={{maxLength: 6}} fullWidth/>
                  </Grid>
                  <Grid xs={6} sm={2}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-full-price`}
                                 name={`${barrel.kegs[kegIndex].id}KegFullPrice`}
                                 label={'Full Price'}
                                 value={barrel.kegs[kegIndex].fullPrice}
                                 onChange={(event) => handleFullPriceChange(event.target.value)}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">&#162;</InputAdornment>,
                                 }}
                                 placeholder={'900'} inputProps={{maxLength: 6}} fullWidth/>
                  </Grid>
                  <Grid xs={6} sm={2}>
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-full-ounces`}
                                 name={`${barrel.kegs[kegIndex].id}KegFullOunces`}
                                 label={'Full Pour Amount'}
                                 value={barrel.kegs[kegIndex].fullOunces}
                                 onChange={(event) => handleFullOuncesChange(event.target.value)}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">oz</InputAdornment>,
                                 }}
                                 placeholder={'5.0'} inputProps={{maxLength: 6}} fullWidth/>
                  </Grid>
                  <Grid xs={12}>
                      <Button variant={'outlined'} onClick={handleShowKegDeleteConfirm} color="error" size="large">
                          Delete
                      </Button>
                  </Grid>
              </Grid>
          </>
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
      <Dialog
        open={showDeleteKegConfirm}
        onClose={handleCloseKegDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete keg {barrel.kegs[kegIndex].name}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseKegDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteKegClick} color={'error'}>Delete Keg</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}