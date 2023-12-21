import React from 'react';
import { withUnauthentificatedLayout } from '@/core/Auth/Layout';
import { VerifyMailReturnCodeToMessage, ZVerifyMailReturnCode } from '@/types';
import { ActionPaper } from '@/components/Base';
import { Button, Link, Typography } from '@mui/material';
import { LoginRounded } from '@mui/icons-material';

const VerifyMail = () => {
  const searchParams = React.useMemo(
    () => new URLSearchParams(window.location.search),
    [window.location.search]
  );
  const message = React.useMemo(() => {
    const code = ZVerifyMailReturnCode.safeParse(searchParams.get('code'));
    if (!code.success) {
      console.error(code.error);
      return "No 'code' provided";
    }
    return VerifyMailReturnCodeToMessage[code.data];
  }, [searchParams]);

  return (
    <ActionPaper
      sx={{
        width: { xs: '90%', md: '40%', lg: '25%' },
        maxWidth: '480px',
        mx: 'auto',
        px: 3,
        py: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h2">Verify Email</Typography>
      <Typography sx={{ my: 1 }}>{message}</Typography>

      <Button LinkComponent={Link} href="/sign-in" startIcon={<LoginRounded />}>
        Login
      </Button>
    </ActionPaper>
  );
};

export default withUnauthentificatedLayout(VerifyMail);
