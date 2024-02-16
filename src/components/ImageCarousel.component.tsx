import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Image } from './Base';
import { Box, Typography, alpha } from '@mui/material';
import { type TTransactionFile } from '@budgetbuddyde/types';
import { ParentSize } from '@visx/responsive';

export type TImageCarouselProps = {
  images: TTransactionFile[];
};

export const ImageCarousel: React.FC<TImageCarouselProps> = ({ images }) => {
  return (
    <Carousel
      swipe
      animation="slide"
      indicators={false}
      navButtonsAlwaysVisible={images.length > 1}
      sx={{ width: '100%', height: '100%' }}
    >
      {images.map((image) => (
        <ParentSize key={image.uuid}>
          {({ width }) => (
            <Box sx={{ width: `${width}px`, height: `${width * 0.73}px` }}>
              <Image
                src={image.location}
                alt={image.fileName}
                sx={{ width: '100%', height: '90%', objectFit: 'contain' }}
              />

              <Typography
                sx={{
                  mx: 'auto',
                  px: 1.5,
                  py: 1,
                  backgroundColor: alpha('#000', 0.3),
                  borderRadius: (theme) => theme.shape.borderRadius + 'px',
                  width: 'fit-content',
                }}
              >
                {image.fileName}
              </Typography>
            </Box>
          )}
        </ParentSize>
      ))}
    </Carousel>
  );
};
