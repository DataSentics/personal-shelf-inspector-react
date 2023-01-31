import { Box, Stack, Text } from "@chakra-ui/react";
import { Product } from "_utils/objects";

type Props = {
  product: Product;
  isEven?: boolean;
  pricetagImgs?: boolean;
  pricetagDetailsImgs?: boolean;
};

function ProductDisplay(props: Props) {
  const { product, isEven, pricetagImgs, pricetagDetailsImgs } = props;

  // console.log(product.collage.bbox);

  return (
    <Box
      backgroundColor={isEven ? "gray.100" : undefined}
      padding={2}
      borderRadius="md"
      _hover={{ bg: "gray.200" }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text>{product.name}</Text>
        <Box backgroundColor="dsPrimary.300" borderRadius="md" padding={3}>
          {product.priceMain}.{product.priceSub}Kč
        </Box>
      </Box>

      <Stack direction="row" wrap="wrap">
        {pricetagImgs && <img src={product.collage.bbox.imageUrl} />}
        {pricetagDetailsImgs && (
          <>
            <Box>
              <Text>Jméno</Text>
              <img src={product.collage.name?.imageUrl} />
            </Box>

            <Box>
              <Text>Cena</Text>
              <img src={product.collage.priceMain?.imageUrl} />
            </Box>

            <Box>
              <Text>Halíře</Text>
              <img src={product.collage.priceSub?.imageUrl} />
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default ProductDisplay;
