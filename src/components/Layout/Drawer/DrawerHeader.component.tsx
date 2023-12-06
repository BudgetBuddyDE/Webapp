import { Brand } from '../../Brand.component';
import { useDrawerStore } from './Drawer.store';
import { StyledDrawerHeader } from './StyledDrawerHeader.component';
import { DrawerHamburger } from './DrawerHamburger.component';

export const DrawerHeader = () => {
  const { open } = useDrawerStore();

  return (
    <StyledDrawerHeader
      sx={{
        justifyContent: { xs: 'space-between', md: open ? 'space-between' : 'center' },
      }}
    >
      <Brand
        boxStyle={{
          display: { xs: 'flex', md: open ? 'flex' : 'none' },
          ml: 2,
        }}
      />

      <DrawerHamburger />
    </StyledDrawerHeader>
  );
};
