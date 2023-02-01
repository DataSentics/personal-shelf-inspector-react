import { Box, Stack, Text } from "@chakra-ui/react";
import { Product } from "_utils/objects";

type Props = {
  product: Product;
  isEven?: boolean;
  pricetagImgs?: boolean;
  pricetagDetailsImgs?: boolean;
};

type ProductImageDisplayProps = Pick<
  Props,
  "product" | "pricetagImgs" | "pricetagDetailsImgs"
>;

function ProductImageDisplay(props: ProductImageDisplayProps) {
  const { product, pricetagImgs, pricetagDetailsImgs } = props;

  if (!pricetagImgs && !pricetagDetailsImgs) return null;

  return (
    <Stack direction="row" wrap="wrap">
      {pricetagImgs && (
        <img alt="Cenovka produktu" src={product.collage.bbox.imageUrl} />
      )}
      {pricetagDetailsImgs && (
        <>
          <Box>
            <Text>Jméno</Text>
            <img alt="Nazov produktu" src={product.collage.name?.imageUrl} />
          </Box>

          <Box>
            <Text>Cena</Text>
            <img
              alt="Cena v celých korunách"
              src={product.collage.priceMain?.imageUrl}
            />
          </Box>

          <Box>
            <Text>Halíře</Text>
            <img
              alt="Cena v halířech"
              src={product.collage.priceSub?.imageUrl}
            />
          </Box>
        </>
      )}
    </Stack>
  );
}

function ProductDisplay(props: Props) {
  const { product, isEven, pricetagImgs, pricetagDetailsImgs } = props;

  return (
    <Box
      backgroundColor={isEven ? "gray.100" : undefined}
      padding={2}
      borderRadius="md"
      role="listitem"
      _hover={{ bg: "gray.200" }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text>{product.name}</Text>
        <Box backgroundColor="dsPrimary.300" borderRadius="md" padding={3}>
          {product.priceMain}.{product.priceSub}Kč
        </Box>
      </Box>

      <ProductImageDisplay
        product={product}
        pricetagImgs={pricetagImgs}
        pricetagDetailsImgs={pricetagDetailsImgs}
      />
    </Box>
  );
}

export default ProductDisplay;
