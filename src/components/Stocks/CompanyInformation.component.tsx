import React from 'react';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  BusinessRounded,
  PublicRounded,
  BookmarkRounded,
  TodayRounded,
  PeopleRounded,
  AttachMoneyRounded,
  PieChartRounded,
  SportsMartialArtsRounded,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { type TAssetDetails } from '@budgetbuddyde/types';
import { Card } from '../Base';
import { formatBalance } from '@/utils';

export type TCompanyInformationProps = {
  details: TAssetDetails;
};

export const CompanyInformation: React.FC<TCompanyInformationProps> = ({ details }) => {
  return (
    <Card sx={{ p: 0 }}>
      <Card.Header sx={{ px: 2, pt: 2 }}>
        <Card.Title>Info</Card.Title>
      </Card.Header>
      <Card.Body sx={{ px: 0 }}>
        <List dense>
          {[
            {
              icon: <BusinessRounded fontSize="small" />,
              text: 'Company',
              value: details.asset.security.etfCompany,
            },
            {
              icon: <PublicRounded fontSize="small" />,
              text: 'Domicile',
              value: details.asset.security.etfDomicile,
            },
            {
              icon: <BookmarkRounded fontSize="small" />,
              text: 'ISIN',
              value: details.asset.security.isin,
            },
            {
              icon: <BookmarkRounded fontSize="small" />,
              text: 'WKN',
              value: details.asset.security.wkn,
            },
            {
              icon: <TodayRounded fontSize="small" />,
              text: 'IPO',
              value: format(details.asset.security.ipoDate, 'dd.MM.yyyy'),
            },
            {
              icon: <PeopleRounded fontSize="small" />,
              text: 'Employees (Full-Time)',
              value: details.details.securityDetails?.fullTimeEmployees.toLocaleString(),
            },
            {
              icon: <SportsMartialArtsRounded fontSize="small" />,
              text: 'CEO',
              value: details.details.securityDetails?.ceo,
            },
            {
              icon: <AttachMoneyRounded fontSize="small" />,
              text: 'Market cap.',
              value: formatBalance(
                details.details.securityDetails?.marketCap ?? 0,
                details.details.securityDetails?.currency
              ),
            },
            {
              icon: <PieChartRounded fontSize="small" />,
              text: 'Shares',
              value: details.details.securityDetails?.shares.toLocaleString(),
            },
          ].map(({ icon, text, value }, idx, arr) => (
            <React.Fragment key={text.toLowerCase()}>
              <ListItem secondaryAction={<Typography>{value}</Typography>}>
                <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
              {idx !== arr.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card.Body>
    </Card>
  );
};
