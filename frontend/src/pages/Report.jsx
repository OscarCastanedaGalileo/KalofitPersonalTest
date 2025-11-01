import { Box } from "@mui/material";
import ScatterChartComponent from "../components/ScatterChartComponent";

const data = [
  { x: 1, y: 81.5 },
  { x: 2, y: 82 },
  { x: 3, y: 50 },
  { x: 4, y: 89.3 },
  { x: 5, y: 40 },
  { x: 6, y: 91 },
  { x: 7, y: 91 },
];

export function Report() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        position: "relative",
        bgcolor: "#0F2922",
        px: 2,
        pb: 10,
      }}
    >
      <Box></Box>
      <Box
        sx={{
          pt: 4,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ScatterChartComponent data={data} />
      </Box>
      
    </Box>
  );
}