import { styled } from '@mui/material';
import { useDrawingArea } from '@mui/x-charts';

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  fontWeight: 'bolder',
  dominantBaseline: 'central',
  fontSize: 28,
}));

export const PieCenterLabel: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
};
