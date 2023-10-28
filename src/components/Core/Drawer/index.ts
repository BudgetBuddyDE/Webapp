export * from './Drawer.component';
export * from './DrawerHamburger.component';
export * from './DrawerHeader.component';
export * from './DrawerItem.component';
export * from './DrawerItems';
export * from './DrawerProfile.component';
export * from './FilterDrawer.component';
export * from './FormDrawer.component';

export function getSavedSidebarState() {
  const saved = localStorage.getItem('bb.sidebar.show');
  return saved == null ? true : saved == 'true';
}

export function saveSidebarState(state: boolean) {
  return localStorage.setItem('bb.sidebar.show', state.toString());
}
