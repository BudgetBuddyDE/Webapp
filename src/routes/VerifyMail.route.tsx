import React from 'react';
import { withUnauthentificatedLayout } from '@/components/Auth/Layout';
import { VerifyMailReturnCodeToMessage, ZVerifyMailReturnCode } from '@budgetbuddyde/types';
import { Card } from '@/components/Base';
import { Button, Link, Typography } from '@mui/material';
import { LoginRounded } from '@mui/icons-material';
import { AppLogo } from '@/components/AppLogo.component';

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
    <Card
      sx={{
        width: { xs: '90%', md: '40%', lg: '30%', xl: '25%' },
        maxWidth: '480px',
        mx: 'auto',
        px: 3,
        py: 2,
        textAlign: 'center',
      }}
    >
      <Card.Header>
        <AppLogo
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '5px',
          }}
          width={96}
          height={96}
        />
      </Card.Header>
      <Card.Body>
        <Typography variant="h2" sx={{ mt: 1 }}>
          Verify Email
        </Typography>
        <Typography sx={{ my: 1 }}>{message}</Typography>

        <Button LinkComponent={Link} href="/sign-in" startIcon={<LoginRounded />}>
          Login
        </Button>
      </Card.Body>
    </Card>
  );
};

export default withUnauthentificatedLayout(VerifyMail);
