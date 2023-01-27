import { Box, Text } from "@chakra-ui/react";
import { Product } from "_utils/objects";

type Props = {
  product: Product;
  isEven?: boolean;
};

function ProductDisplay(props: Props) {
  const { product, isEven } = props;

  return (
    <Box
      backgroundColor={isEven ? "gray.100" : undefined}
      padding={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      borderRadius="md"
      _hover={{ bg: "gray.200" }}
    >
      <Text>{product.name}</Text>
      <Box backgroundColor="dsPrimary.300" borderRadius="md" padding={3}>
        {product.priceMain}.{product.priceSub}Kč
      </Box>
    </Box>
  );
}

export default ProductDisplay;
