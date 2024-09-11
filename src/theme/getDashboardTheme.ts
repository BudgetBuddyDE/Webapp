import {createTheme} from '@mui/material/styles';

import {
  chartsCustomizations,
  dataDisplayCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  feedbackCustomizations,
  gridCustomizations,
  inputsCustomizations,
  navigationCustomizations,
  surfacesCustomizations,
} from './customizations';
import {getDesignTokens} from './themePrimitives';

export const V6Theme = createTheme({
  ...getDesignTokens('dark'),
  components: {
    ...gridCustomizations,
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...inputsCustomizations,
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations,
  },
});
