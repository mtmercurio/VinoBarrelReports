import {
  Button, Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {BeverageUI} from "../library/FirebaseUtils";

export default function BeverageCard(props: { beverage: BeverageUI, onDeleteButtonClick: (beverage: BeverageUI) => void }) {
  const navigate = useNavigate();
  const [imgUrl, setImgUrl] = useState('')
  const storage = getStorage();
  const bottleRef = ref(storage, props.beverage.image);

  useEffect(() => {
    if (props.beverage.image) {
      getDownloadURL(bottleRef)
        .then((url) => {
          setImgUrl(url)
        })
        .catch((error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/object-not-found':
              // File doesn't exist
              break;
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              // User canceled the upload
              break;

            // ...

            case 'storage/unknown':
              // Unknown error occurred, inspect the server response
              break;
          }
        });
    }
  }, [bottleRef, props.beverage.image])

  return (
    <Card>
      <CardActionArea onClick={() => navigate(`/beverages/${props.beverage.id}`)}>
        <CardMedia
          sx={{maxHeight: 350, mt: 2, objectFit: "contain"}}
          image={imgUrl}
          title="bottle"
          component='img'
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {props.beverage.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.beverage?.info}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.beverage?.tastingNotes}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="large" color="error"
                onClick={() => props.onDeleteButtonClick(props.beverage)}>Delete</Button>
      </CardActions>
    </Card>
  )
}