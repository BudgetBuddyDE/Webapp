import React from 'react';
import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Card, Image, Linkify } from '../Base';

export type TCompanyInformationProps = {
  name: string;
  logo: string;
  type: string;
  domicile?: string;
  identifier: string;
  wkn: string;
  website?: string;
};

export const CompanyInformation: React.FC<TCompanyInformationProps> = ({
  name,
  logo,
  type,
  domicile = 'Unknown',
  identifier,
  wkn,
  website = 'Unknown',
}) => {
  return (
    <Card sx={{ p: 0 }}>
      <Card.Header sx={{ p: 2, pb: 0 }}>
        <Box sx={{ display: 'flex' }}>
          <Image
            src={logo}
            alt={'Stock Logo'}
            sx={{
              width: '40px',
              height: '40px',
              mr: 1,
            }}
          />
          <Box>
            <Card.Title>{name}</Card.Title>
            <Card.Subtitle>Company information</Card.Subtitle>
          </Box>
        </Box>
      </Card.Header>
      <Card.Body>
        <List dense>
          <ListItem>
            <ListItemText primary="Type" secondary={<Typography>{type}</Typography>} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Domicil" secondary={<Typography>{domicile}</Typography>} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="ISIN" secondary={<Typography>{identifier}</Typography>} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="WKN" secondary={<Typography>{wkn}</Typography>} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Website" secondary={<Linkify>{website}</Linkify>} />
          </ListItem>
        </List>
      </Card.Body>
    </Card>
  );
};
