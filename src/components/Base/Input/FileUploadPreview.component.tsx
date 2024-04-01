import React from 'react';
import {Avatar, Box, type AvatarProps, IconButton} from '@mui/material';
import {type TTransactionFile} from '@budgetbuddyde/types';
import {DeleteRounded} from '@mui/icons-material';

export type TFileUploadPreview = Pick<TTransactionFile, 'fileName' | 'fileSize' | 'mimeType'> & {
  uuid?: TTransactionFile['uuid'];
  location?: TTransactionFile['location'];
  buffer: string | ArrayBuffer | null;
};

export type TFileUploadPreviewProps = TFileUploadPreview &
  AvatarProps & {
    onDelete?: (file: TFileUploadPreview) => void;
  };

export const FileUploadPreview: React.FC<TFileUploadPreviewProps> = ({
  uuid,
  fileName,
  fileSize,
  mimeType,
  buffer,
  location,
  onDelete,
  ...avatarProps
}) => {
  const PreviewImage = () => {
    return (
      <Avatar
        variant="rounded"
        alt={'Image ' + fileName}
        src={location ? location : buffer ? buffer.toString() : undefined}
        {...avatarProps}
        sx={{
          width: '100%',
          height: 'auto',
          aspectRatio: '1/1',
          border: '1px solid',
          borderColor: 'action.disabled',
          color: 'action.disabled',
          ':hover': {
            borderColor: 'action.active',
            color: 'action.active',
          },
          ...avatarProps.sx,
        }}
      />
    );
  };
  if (onDelete) {
    return (
      <Box sx={{position: 'relative'}}>
        <PreviewImage />
        <IconButton
          aria-label="delete"
          onClick={() => onDelete({uuid, fileName, fileSize, mimeType, buffer, location})}
          sx={{
            position: 'absolute',
            inset: 0,
            border: '1px solid',
            borderColor: 'action.disabled',
            color: 'action.disabled',
            ':hover': {
              color: 'action.active',
              borderColor: 'action.active',
            },
          }}>
          <DeleteRounded />
        </IconButton>
      </Box>
    );
  }
  return <PreviewImage />;
};
