import { motion } from 'framer-motion';
import { Footer } from '@/components/Core/Footer.component';
import '@/style/main.css';
import { Box, CircularProgress, styled } from '@mui/material';
import { Brand } from '../Core/Brand.component';

const Main = styled('main')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'inherit',
    justifyContent: 'center',
    alignItems: 'center',
}));

export const FullPageLoading = () => {
    return (
        <Main>
            <Box
                sx={{
                    width: 'auto',
                    maxWidth: { xs: '90%', md: '450px' },
                    mt: 'auto',
                    px: 3,
                    py: 2,
                    textAlign: 'center',
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 180,
                        damping: 15,
                        bounce: 10,
                    }}
                >
                    <CircularProgress sx={{ mb: 0.5 }} size={33} />
                    <Brand />
                </motion.div>
            </Box>

            <Box sx={{ mt: 'auto' }} children={<Footer />} />
        </Main>
    );
};
