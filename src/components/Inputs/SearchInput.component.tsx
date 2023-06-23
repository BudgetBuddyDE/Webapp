import { debounce } from 'lodash';
import React from 'react';
import { KeyboardBtn } from '@/components/Base';
import { useWindowDimensions } from '@/hooks';
import { determineIfMobileDevice, determineOperatingSystem } from '@/utils';
import type { SxProps, Theme } from '@mui/base';
import { Search as SearchIcon } from '@mui/icons-material';
import { InputBase, alpha, styled } from '@mui/material';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '20ch',
            '&:focus': {
                width: '30ch',
            },
        },
    },
}));

export interface SearchInputProps {
    placeholder?: string;
    onSearch: (text: string) => void;
    sx?: SxProps<Theme>;
}

export const SearchInput: React.FC<SearchInputProps> = ({ placeholder = 'Search…', onSearch, sx }) => {
    const windowSize = useWindowDimensions();
    const os = determineOperatingSystem();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const isMobileDevice = React.useMemo(() => determineIfMobileDevice(), [windowSize]);

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            inputRef.current?.focus();
        }
    };

    React.useEffect(() => {
        if (!isMobileDevice) {
            document.addEventListener('keydown', handleKeyPress);
        }
        return () => {
            if (!isMobileDevice) {
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
    }, [isMobileDevice]);

    return (
        <Search sx={sx}>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                inputRef={inputRef}
                placeholder={placeholder}
                inputProps={{ 'aria-label': 'search' }}
                endAdornment={
                    isMobileDevice ? undefined : (
                        <KeyboardBtn style={{ marginRight: '8px' }}>{os === 'macOS' ? 'Cmd' : 'Ctrl'} + K</KeyboardBtn>
                    )
                }
                onChange={debounce((e) => onSearch(e.target.value), 150)}
            />
        </Search>
    );
};
