import { AlternateEmailRounded, AppSettingsAltRounded, CodeRounded, LanguageRounded } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { version } from '../../../package.json';
import { Card, StyledLink } from '../Base';
import { ExportProfileData } from '../Profile';

export const AboutInformation = () => {
    return (
        <Card>
            <Card.Header>
                <Box>
                    <Card.Title>About</Card.Title>
                    <Card.Subtitle>
                        ReactJS bases web-app to keep track of your finances and manage your montly budget.
                    </Card.Subtitle>
                </Box>
            </Card.Header>
            <Card.Body>
                <Stack spacing={2} direction="row" alignItems="center" sx={{ mt: 1 }}>
                    <LanguageRounded />
                    <StyledLink href="https://budget-buddy.de" target="_blank">
                        Website
                    </StyledLink>
                </Stack>

                <Stack spacing={2} direction="row" alignItems="center" sx={{ mt: 1 }}>
                    <AlternateEmailRounded />
                    <StyledLink href="mailto:contact@budget-buddy.de">Contact</StyledLink>
                </Stack>

                <Stack spacing={2} direction="row" alignItems="center" sx={{ mt: 1 }}>
                    <CodeRounded />
                    <StyledLink href="https://github.com/BudgetBuddyDE/Webapp" target="_blank">
                        Source Code
                    </StyledLink>
                </Stack>

                <Stack spacing={2} direction="row" alignItems="center" sx={{ mt: 1 }}>
                    <AppSettingsAltRounded />
                    <Typography noWrap>Version {version}</Typography>
                </Stack>

                <Divider sx={{ mt: 2, mb: 0 }} />

                <ExportProfileData />
            </Card.Body>
        </Card>
    );
};
