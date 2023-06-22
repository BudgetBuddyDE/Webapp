export function getSavedSidebarState() {
    const saved = localStorage.getItem('bb.sidebar.show');
    return saved == null ? true : saved == 'true';
}

export function saveSidebarState(state: boolean) {
    return localStorage.setItem('bb.sidebar.show', state.toString());
}

export * from './Drawer.component';
export * from './DrawerHeader.component';
export * from './DrawerItem.component';
export * from './DrawerProfile.component';
export * from './FilterDrawer.component';
