import { ToggleButton, ToggleButtonGroup, Button } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import FoodsSearch from "./pages/FoodsSearch";
import { useNavigate, Link  } from "react-router";
function App() {
  const { mode, setMode } = useColorScheme();
  const handleChangeColorMode = (event, newMode) => setMode(newMode);

  return (
    <>
      {/* Light/Dark Toggle */}
       <Button variant="contained" color="primary">Hello World</Button>
      <ToggleButtonGroup value={mode} exclusive onChange={handleChangeColorMode}>
        <ToggleButton value="light">Light</ToggleButton>
        <ToggleButton value="dark">Dark</ToggleButton>
        <ToggleButton value="system">System</ToggleButton>
      </ToggleButtonGroup>

      {/* Button for Log UI */}
      <FoodsSearch />
      <Button variant="contained" sx={{ mt: 2 }}  component={Link} to="/log">
        Log
      </Button>
    </>
  );
}
export default App;
