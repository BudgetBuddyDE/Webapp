import React from 'react';
import { IconButton, type IconButtonProps } from '@mui/material';
import { UploadFileRounded } from '@mui/icons-material';

export type TUploadedFile = FileList;

export type TFileUploadProps = IconButtonProps & {
  onFileUpload: (files: TUploadedFile) => void;
  multiple?: HTMLInputElement['multiple'];
  accept?: HTMLInputElement['accept'];
};

export const FileUpload: React.FC<TFileUploadProps> = ({
  onFileUpload,
  multiple = false,
  accept,
  ...props
}) => {
  const fileUploadInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <IconButton
      onClick={() => fileUploadInputRef.current?.click()}
      color="primary"
      {...props}
      sx={{
        aspectRatio: '1/1',
        border: '1px solid',
        borderColor: 'action.disabled',
        color: 'action.disabled',
        ':hover': {
          borderColor: 'action.active',
          color: 'action.active',
        },
        ':focus': {
          borderWidth: '2px',
          borderColor: 'primary.main',
          color: 'primary.main',
        },
        ...props.sx,
      }}
    >
      <UploadFileRounded />
      <input
        type="file"
        ref={fileUploadInputRef}
        accept={accept}
        onChange={(event) => {
          const files = event.target.files;
          if (!files || (files && files.length === 0)) return;
          onFileUpload(files);
        }}
        multiple={multiple}
        hidden
      />
    </IconButton>
  );
};
