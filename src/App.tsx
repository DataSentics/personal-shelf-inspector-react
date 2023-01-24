import { ChakraProvider } from "@chakra-ui/react";

import Main from "./_screens/Main";

function App() {
  return (
    <ChakraProvider>
      <Main />
    </ChakraProvider>
  );
}

export default App;
