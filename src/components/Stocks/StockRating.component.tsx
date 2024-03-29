import React from 'react';
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Rating,
  Typography,
} from '@mui/material';
import { StarRounded } from '@mui/icons-material';
import { Card, NoResults } from '@/components/Base';
import { type TAssetDetails } from '@budgetbuddyde/types';

export type TStockRatingProps = {
  ratings: TAssetDetails['details']['scorings'];
};

export const StockRating: React.FC<TStockRatingProps> = ({ ratings }) => {
  return (
    <Card sx={{ p: 0 }}>
      <Card.Header sx={{ p: 2, pb: 0 }}>
        <Box>
          <Card.Title>Ratings</Card.Title>
          <Card.Subtitle>There are {ratings.length} published ratings</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body>
        {ratings.length > 0 ? (
          <List>
            {ratings.map((article, idx, arr) => (
              <React.Fragment key={idx}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box>
                        <Typography>{article.source}</Typography>
                        <Chip label={article.type} color="primary" size="small" />
                      </Box>
                    }
                    secondary={<Rating value={article.value} max={article.maxValue} readOnly />}
                  />
                </ListItem>
                {idx + 1 !== arr.length && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <NoResults
            icon={<StarRounded />}
            text="There are no public ratings available."
            sx={{ m: 2 }}
          />
        )}
      </Card.Body>
    </Card>
  );
};
