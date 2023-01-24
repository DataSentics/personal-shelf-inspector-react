import { useEffect, useState } from "react";
import { GraphModel, loadGraphModel } from "@tensorflow/tfjs";
import {
  Box,
  Button,
  FormLabel,
  Heading,
  Switch,
  Text,
} from "@chakra-ui/react";

import { Camera, TensorDev } from "_components";
import {
  MODEL_NAME_PRICE_PATH,
  // MODEL_NAME_PRICE_SIZE,
  MODEL_PRICETAG_PATH,
} from "_constants";

const loadingState = (model: GraphModel | null) =>
  model ? "Loaded!" : "Loading...";

function Main() {
  const [photo, setPhoto] = useState<File>();
  const [priceTagModel, setPriceTagModel] = useState<GraphModel | null>(null);
  const [namePriceModel, setNamePriceModel] = useState<GraphModel | null>(null);

  // const [photoUrl, setPhotoUrl] = useState<string>();

  // console.log(photo);

  useEffect(() => {
    loadGraphModel(MODEL_PRICETAG_PATH).then((mdl) => setPriceTagModel(mdl));
    loadGraphModel(MODEL_NAME_PRICE_PATH).then((mdl) => setNamePriceModel(mdl));
  }, []);

  const onPhotoTaken = (newPhoto: File) => {
    // const objectUrl = URL.createObjectURL(newPhoto);

    // setPhotoUrl(objectUrl);
    setPhoto(newPhoto);
  };

  return (
    <div style={{ padding: "0.5rem" }}>
      <Heading>Personal Shelf Inspector</Heading>
      <Text fontSize="xs">PriceTags model: {loadingState(priceTagModel)}</Text>
      <Text fontSize="xs">
        Names&Prices model: {loadingState(namePriceModel)}
      </Text>
      {/* <p>
        <label htmlFor="imageFile">
          Upload a photo of shop shelf using button below
        </label>
      </p> */}
      {/* <Box>
        <FormLabel></FormLabel>
        <Switch id="useCameraSwith"/>
      </Box> */}
      <Camera onPhotoTaken={onPhotoTaken} inputCapture={false}>
        <Button>Take photos</Button>
      </Camera>
      <TensorDev
        image={photo}
        pricetagGraphModel={priceTagModel}
        namePriceGraphModel={namePriceModel}
      />
    </div>
  );
}

export default Main;
