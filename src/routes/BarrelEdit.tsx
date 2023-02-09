import {
  CircularProgress,
  Container, Fab, InputAdornment,
  MenuItem, SxProps,
  Tab, Tabs, Zoom
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import {Barrel, Keg} from "./BarrelsOverview";
import {doc, getDoc, setDoc} from "firebase/firestore";
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
  milliliters: 0,
  tastingNotes: [],
  smallPrice: 0,
  fullPrice: 0,
  smallMilliliters: 0,
  fullMilliliters: 0,
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
      setHasChanged(false)
    }
  }

  const deleteKeg = () => {
    setBarrel(barrel => {
      barrel.kegs.splice(kegIndex, 1)
      console.log(barrel)
      return {...barrel}
    })
    setKegIndex(0)
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

  const handleMillilitersChange = (milliliters: string) => {
    setHasChanged(true)
    if (!isNaN(Number(milliliters))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].milliliters = parseInt(milliliters)
        return {...barrel}
      })
    }
  }

  const handleTastingNotesChange = (tastingNotes: string) => {
    setHasChanged(true)
    const tastingNotesArray = tastingNotes.split(', ')
    setBarrel(barrel => {
      barrel.kegs[kegIndex].tastingNotes = tastingNotesArray
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

  const handleSmallMillilitersChange = (smallMilliliters: string) => {
    setHasChanged(true)
    if (!isNaN(Number(smallMilliliters))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].smallMilliliters = parseInt(smallMilliliters)
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

  const handleFullMillilitersChange = (fullMilliliters: string) => {
    setHasChanged(true)
    if (!isNaN(Number(fullMilliliters))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].fullMilliliters = parseInt(fullMilliliters)
        return {...barrel}
      })
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setKegIndex(newValue);
  };

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const fabStyle = {
    position: 'fixed',
    bottom: 16,
    right: 16,
    [theme.breakpoints.up('sm')]: {
      position: 'relative',
      bottom: 125,
      left: 750
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
        setBarrel(barrel => {
          barrel.kegs.push(defaultKeg)
          return {...barrel}
        })
        saveBarrel().then()
      }
    },
    {
      color: 'inherit' as 'inherit',
      sx: {...fabStyle, ...fabGreenStyle} as SxProps,
      icon: <SaveIcon/>,
      label: 'Save',
      shouldShow: hasChanged,
      handleOnClick: () => {
        saveBarrel().then(() =>
          setHasChanged(false)
        )
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
              <TextField id={`barrelName`} name={`barrelName`} label={'Barrel Name'}
                         value={barrel?.name} onChange={handleBarrelNameChange} placeholder={'Barrel Name'}
                         inputProps={{maxLength: 45}}/>
              <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                  <Tabs value={kegIndex} variant="scrollable" scrollButtons="auto" onChange={handleTabChange}
                        aria-label="keg tabs">
                    {barrel.kegs.map((keg, index) =>
                      <Tab label={keg.name} key={index}/>
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
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-milliliters`}
                                 name={`${barrel.kegs[kegIndex].id}KegMilliliters`}
                                 label={'Total Amount in Keg'}
                                 value={barrel.kegs[kegIndex].milliliters}
                                 onChange={(event) => handleMillilitersChange(event.target.value)}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">ml</InputAdornment>,
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
                                 value={barrel.kegs[kegIndex].tastingNotes.join(', ')}
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
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-small-milliliters`}
                                 name={`${barrel.kegs[kegIndex].id}KegSmallMilliliters`}
                                 label={'Small Pour Amount'}
                                 value={barrel.kegs[kegIndex].smallMilliliters}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">ml</InputAdornment>,
                                 }}
                                 onChange={(event) => handleSmallMillilitersChange(event.target.value)}
                                 placeholder={'45'} inputProps={{maxLength: 6}} fullWidth/>
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
                      <TextField id={`${barrel.kegs[kegIndex].id}-keg-full-milliliters`}
                                 name={`${barrel.kegs[kegIndex].id}KegFullMilliliters`}
                                 label={'Full Pour Amount'}
                                 value={barrel.kegs[kegIndex].fullMilliliters}
                                 onChange={(event) => handleFullMillilitersChange(event.target.value)}
                                 InputProps={{
                                   endAdornment: <InputAdornment position="end">ml</InputAdornment>,
                                 }}
                                 placeholder={'177'} inputProps={{maxLength: 6}} fullWidth/>
                  </Grid>
                  <Grid xs={12}>
                      <Button onClick={deleteKeg} color="error">
                          Delete Keg
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
          <Fab sx={fab.sx} variant="extended" aria-label={fab.label} color={fab.color} onClick={fab.handleOnClick}>
            {fab.icon}
          </Fab>
        </Zoom>
      ))}
    </Container>
  )
}