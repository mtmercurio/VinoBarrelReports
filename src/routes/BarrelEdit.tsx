import {
  CircularProgress,
  Container, Dialog, DialogActions, DialogTitle, Fab, InputAdornment, Stack, SxProps,
  Tab, Tabs, Zoom
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import * as React from "react";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import {green} from "@mui/material/colors";
import {useTheme} from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import './BarrelEdit.css'
import SaveIcon from '@mui/icons-material/Save';
import Button from "@mui/material/Button";
import {FormContainer, SelectElement, TextFieldElement} from "react-hook-form-mui";
import {BarrelUI, BeverageUI, getBarrel, getBeverages, KegUI, saveBarrel} from "../library/FirestoreUtils";

const kegIds = ['red', 'green', 'blue'] as const;
const defaultKeg: KegUI = {
  id: '',
  ounces: 0,
  smallPrice: 0,
  fullPrice: 0,
  smallOunces: 0,
  fullOunces: 0,
}

export default function BarrelEdit() {
  const {barrelId} = useParams<{ barrelId: string }>();
  const theme = useTheme();
  const [barrel, setBarrel] = useState<BarrelUI>()
  const [beverages, setBeverages] = useState<BeverageUI[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [kegIndex, setKegIndex] = useState(0);
  const [showDeleteKegConfirm, setShowDeleteKegConfirm] = useState(false);

  const onSubmit = (barrel: BarrelUI) => {
    saveBarrel(barrel).then(r => console.log(r))
  }

  useEffect(() => {
    if (barrelId) {
      setIsLoading(true);
      getBarrel(barrelId)
        .then((barrel) => {
          if (barrel) {
            setBarrel(barrel)
          }
          setIsLoading(false);
        })
    } else {
      setIsLoading(false)
    }
  }, [barrelId])

  useEffect(() => {
    getBeverages().then(beverages => setBeverages(beverages))
  }, [])

  const handleShowKegDeleteConfirm = () => {
    setShowDeleteKegConfirm(true);
  }

  const handleCloseKegDeleteConfirm = () => {
    setShowDeleteKegConfirm(false);
  }

  const handleDeleteKegClick = () => {
    if (barrel) {
      const _barrel = {...barrel}
      _barrel.kegs.splice(kegIndex, 1)
      setBarrel(_barrel)
      saveBarrel(_barrel).then()
    }
    setKegIndex(0)
    setShowDeleteKegConfirm(false)
  }

  const handleAddKegClick = () => {
    if (barrel) {
      const _barrel = {...barrel}
      _barrel.kegs.push(defaultKeg)
      setBarrel(_barrel)
      setKegIndex(_barrel.kegs.length - 1)
      saveBarrel(_barrel).then()
    }
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
      shouldShow: true,
      handleOnClick: () => {
        handleAddKegClick()
      }
    },
    {
      color: 'inherit' as 'inherit',
      sx: {...fabStyle, ...fabGreenStyle} as SxProps,
      icon: <SaveIcon/>,
      label: 'Save',
      shouldShow: false,
      handleOnClick: () => {
        // saveBarrel().then()
      }
    },
  ];

  const handleSelectNameOnChange = (beveragePath: string) => {
    if (beverages && barrel) {
      const beverageIndex = beverages.findIndex(beverage => beverage.ref?.path === beveragePath)
      barrel.kegs[kegIndex].beverage = beverages[Number(beverageIndex)]
      setBarrel({...barrel});
    }
  };

  const handleSelectIdOnChange = (kegId: string) => {
    if (barrel) {
      barrel.kegs[kegIndex].id = kegId
      setBarrel({...barrel});
    }
  };

  return (
    <Container>
      {!isLoading &&
          <FormContainer
              defaultValues={barrel}
              onSuccess={onSubmit}
          >
              <Stack spacing={2} direction="row" sx={{mb: 3}}>
                  <TextFieldElement name={`name`} label={'Barrel Name'} sx={{mr: 5}} required/>
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
                  <Button type={'submit'} color={'success'} sx={buttonStyle as SxProps}>
                      Save
                  </Button>
              </Stack>
              <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                  <Tabs value={kegIndex} variant="scrollable" scrollButtons="auto" onChange={handleTabChange}
                        aria-label="keg tabs">
                    {barrel?.kegs.map((keg, index) => {
                      return <Tab key={index} label={`${keg?.beverage?.name || ''} (${keg?.id || ''})`}/>
                    })}
                  </Tabs>
              </Box>
            {barrel?.kegs.map((keg, index) => (
              <React.Fragment key={index}>
                {kegIndex === index &&
                    <Grid container spacing={2} sx={{mb: 8}}>
                        <Grid xs={12} sm={6}>
                            <SelectElement
                                name={`kegs[${index}].beveragePath`}
                                label="Beverage"
                                options={beverages?.map((beverage) => {
                                  return {id: beverage.ref?.path, label: beverage.name}
                                })}
                                fullWidth
                                onChange={handleSelectNameOnChange}
                            />
                        </Grid>
                        <Grid xs={6} sm={3}>
                            <SelectElement
                                name={`kegs[${index}].id`}
                                label="Keg ID"
                                options={kegIds.map((kegId) => {
                                  return {id: kegId, label: kegId}
                                })}
                                fullWidth
                                onChange={handleSelectIdOnChange}
                            />
                        </Grid>
                        <Grid xs={6} sm={3}>
                            <TextFieldElement name={`kegs[${index}].ounces`} label={'Total Amount in Keg'} fullWidth
                                              InputProps={{
                                                endAdornment: <InputAdornment position="end">oz</InputAdornment>,
                                              }}
                                              type={'number'}/>
                        </Grid>
                        <Grid xs={6} sm={2}>
                            <TextFieldElement name={`kegs[${index}].smallPrice`} label={'Small Price'} fullWidth
                                              InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>
                                              }}
                                              type={'number'}/>
                        </Grid>
                        <Grid xs={6} sm={2}>
                            <TextFieldElement name={`kegs[${index}].smallOunces`} label={'Small Pour Amount'} fullWidth
                                              InputProps={{
                                                endAdornment: <InputAdornment position="end">oz</InputAdornment>
                                              }}
                                              type={'number'}/>
                        </Grid>
                        <Grid xs={6} sm={2}>
                            <TextFieldElement name={`kegs[${index}].fullPrice`} label={'Full Price'} fullWidth
                                              InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>
                                              }}
                                              type={'number'}/>
                        </Grid>
                        <Grid xs={6} sm={2}>
                            <TextFieldElement name={`kegs[${index}].fullOunces`} label={'Full Pour Amount'} fullWidth
                                              InputProps={{
                                                endAdornment: <InputAdornment position="end">oz</InputAdornment>,
                                              }}
                                              type={'number'}/>
                        </Grid>
                        <Grid xs={12}>
                            <Button variant={'outlined'} onClick={handleShowKegDeleteConfirm} color="error"
                                    size="large">
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                }
              </React.Fragment>
            ))}
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
      <Dialog
        open={showDeleteKegConfirm}
        onClose={handleCloseKegDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete keg {barrel?.kegs[kegIndex]?.beverage?.name}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseKegDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteKegClick} color={'error'}>Delete Keg</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}