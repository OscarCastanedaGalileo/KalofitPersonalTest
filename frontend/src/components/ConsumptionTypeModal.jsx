import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stack,
  Typography
} from '@mui/material';
import { RestaurantMenu, MenuBook } from '@mui/icons-material';

export default function ConsumptionTypeModal({ 
  open, 
  onClose,
  onFoodSelect,
  onRecipeSelect 
}) {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Register Consumption</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ py: 2 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<RestaurantMenu />}
            onClick={onFoodSelect}
            sx={{ py: 2 }}
          >
            <Typography>
              Register Food Consumption
            </Typography>
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<MenuBook />}
            onClick={onRecipeSelect}
            sx={{ py: 2 }}
          >
            <Typography>
              Register Recipe Consumption
            </Typography>
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}