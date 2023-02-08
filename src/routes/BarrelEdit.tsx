import {
  CircularProgress,
  Container, FormControl,
  InputLabel, MenuItem, Select,
  Stack
} from "@mui/material";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import {Barrel} from "./BarrelsOverview";
import {doc, getDoc} from "firebase/firestore";
import {Firestore} from "@firebase/firestore";

export default function BarrelEdit(props: { db: Firestore }) {
  // const navigate = useNavigate();
  const {barrelId} = useParams<{ barrelId: string }>();
  const [barrel, setBarrel] = useState<Barrel>({
    id: '',
    name: "",
    temperature: 0,
    kegs: [
      {
        id: 'red',
        name: '',
        info: '',
        image: '',
        milliliters: 0,
        tastingNotes: [],
        smallPrice: 0,
        fullPrice: 0,
        smallMilliliters: 0,
        fullMilliliters: 0,
      }
    ]
  })
  const [isLoading, setIsLoading] = useState(false);

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

  const handleBarrelNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBarrel(barrel => {
      return {...barrel, name: event.target.value}
    })
  }

  // const handleDoneClick = () => {
  //   navigate('/barrels')
  // }

  // const saveBarrel = () => {
    // return fetch(`http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:${process.env.REACT_APP_SERVER_API_PORT}/barrels`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     ...barrel,
    //     id: barrelId,
    //   })
    // })
    //   .then(response => {
    //     return response.json()
    //   })
    //   .then(() => {
    //   })
  // }

  const handleIdSelect = async (kegId: 'red' | 'blue' | 'green', kegIndex: number) => {
    setBarrel(barrel => {
      barrel.kegs[kegIndex].id = kegId
      return {...barrel}
    })
  }

  const handleNameChange = (name: string, kegIndex: number) => {
    setBarrel(barrel => {
      barrel.kegs[kegIndex].name = name
      return {...barrel}
    })
  }

  const handleInfoChange = (info: string, kegIndex: number) => {
    setBarrel(barrel => {
      barrel.kegs[kegIndex].info = info
      return {...barrel}
    })
  }

  const handleImageChange = (image: string, kegIndex: number) => {
    setBarrel(barrel => {
      barrel.kegs[kegIndex].image = image
      return {...barrel}
    })
  }

  const handleMillilitersChange = (milliliters: string, kegIndex: number) => {
    if (!isNaN(Number(milliliters))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].milliliters = parseInt(milliliters)
        return {...barrel}
      })
    }
  }

  const handleTastingNotesChange = (tastingNotes: string, kegIndex: number) => {
    const tastingNotesArray = tastingNotes.split(', ')
    setBarrel(barrel => {
      barrel.kegs[kegIndex].tastingNotes = tastingNotesArray
      return {...barrel}
    })
  }

  const handleSmallPriceChange = (smallPrice: string, kegIndex: number) => {
    if (!isNaN(Number(smallPrice))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].smallPrice = parseInt(smallPrice)
        return {...barrel}
      })
    }
  }

  const handleSmallMillilitersChange = (smallMilliliters: string, kegIndex: number) => {
    if (!isNaN(Number(smallMilliliters))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].smallMilliliters = parseInt(smallMilliliters)
        return {...barrel}
      })
    }
  }

  const handleFullPriceChange = (fullPrice: string, kegIndex: number) => {
    if (!isNaN(Number(fullPrice))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].fullPrice = parseInt(fullPrice)
        return {...barrel}
      })
    }
  }

  const handleFullMillilitersChange = (fullMilliliters: string, kegIndex: number) => {
    if (!isNaN(Number(fullMilliliters))) {
      setBarrel(barrel => {
        barrel.kegs[kegIndex].fullMilliliters = parseInt(fullMilliliters)
        return {...barrel}
      })
    }
  }

  return (
    <Container
      component="form"
      noValidate
      autoComplete="off"
    >
      {!isLoading &&
          <Stack spacing={6}>
              <TextField id={`barrelName`} name={`barrelName`} label={'Barrel Name'}
                         value={barrel?.name} onChange={handleBarrelNameChange} placeholder={'Barrel Name'}
                         sx={{width: '45ch'}} inputProps={{maxLength: 45}}
              />
            {barrel.kegs.map((keg, index) =>
              <Stack spacing={2}>
                <FormControl>
                  <InputLabel id={`${keg.id}-id-select-label`}>ID</InputLabel>
                  <Select
                    labelId={`${keg.id}-id-select-label`}
                    id={`${keg.id}-id-select`}
                    value={keg.id}
                    label="ID"
                    name={`${keg.id}_id`}
                  >
                    <MenuItem key={'red'} value={'red'} onClick={() => handleIdSelect('red', index)}>red</MenuItem>
                    <MenuItem key={'green'} value={'green'}
                              onClick={() => handleIdSelect('green', index)}>green</MenuItem>
                    <MenuItem key={'blue'} value={'blue'} onClick={() => handleIdSelect('blue', index)}>blue</MenuItem>
                  </Select>
                </FormControl>
                <TextField id={`${keg.id}-keg-name`} name={`${keg.id}KegName`} label={'Name'}
                           value={keg.name} onChange={(event) => handleNameChange(event.target.value, index)}
                           placeholder={'Name'} inputProps={{maxLength: 50}}
                />
                <TextField id={`${keg.id}-keg-info`} name={`${keg.id}KegInfo`} label={'Info'}
                           value={keg.info} onChange={(event) => handleInfoChange(event.target.value, index)}
                           placeholder={'Info'} inputProps={{maxLength: 100}}
                />
                <TextField id={`${keg.id}-keg-image`} name={`${keg.id}KegImage`} label={'Image'}
                           value={keg.image} onChange={(event) => handleImageChange(event.target.value, index)}
                           placeholder={'Image'} inputProps={{maxLength: 100}}
                />
                <TextField id={`${keg.id}-keg-milliliters`} name={`${keg.id}KegMilliliters`} label={'Milliliters'}
                           value={keg.milliliters}
                           onChange={(event) => handleMillilitersChange(event.target.value, index)}
                           placeholder={'Milliliters'} inputProps={{maxLength: 100}}
                />
                <TextField id={`${keg.id}-keg-tasting-notes`} name={`${keg.id}KegTastingNotes`} label={'Tasting Notes'}
                           value={keg.tastingNotes.join(', ')}
                           onChange={(event) => handleTastingNotesChange(event.target.value, index)}
                           placeholder={'Tasting Notes'} multiline={true} inputProps={{maxLength: 300}}
                />
                <TextField id={`${keg.id}-keg-small-price`} name={`${keg.id}KegSmallPrice`} label={'Small Price'}
                           value={keg.smallPrice}
                           onChange={(event) => handleSmallPriceChange(event.target.value, index)}
                           placeholder={'Small Price'} inputProps={{maxLength: 6}}
                />
                <TextField id={`${keg.id}-keg-small-milliliters`} name={`${keg.id}KegSmallMilliliters`}
                           label={'Small Milliliters'}
                           value={keg.smallMilliliters}
                           onChange={(event) => handleSmallMillilitersChange(event.target.value, index)}
                           placeholder={'Small Milliliters'} inputProps={{maxLength: 6}}
                />
                <TextField id={`${keg.id}-keg-full-price`} name={`${keg.id}KegFullPrice`} label={'Full Price'}
                           value={keg.fullPrice} onChange={(event) => handleFullPriceChange(event.target.value, index)}
                           placeholder={'Full Price'} inputProps={{maxLength: 6}}
                />
                <TextField id={`${keg.id}-keg-full-milliliters`} name={`${keg.id}KegFullMilliliters`}
                           label={'Full Milliliters'}
                           value={keg.fullMilliliters}
                           onChange={(event) => handleFullMillilitersChange(event.target.value, index)}
                           placeholder={'Full Milliliters'} inputProps={{maxLength: 6}}
                />
              </Stack>
            )}
          </Stack>
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