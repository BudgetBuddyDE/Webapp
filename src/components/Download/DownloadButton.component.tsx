import {Button, type ButtonProps, Tooltip} from '@mui/material';
import React from 'react';

import {useSnackbarContext} from '@/components/Snackbar';

export type TDownloadButtonProps = ButtonProps & {
  exportFormat: /*'CSV' |*/ 'JSON';
  exportFileName: string;
  data: object;
  withTooltip?: boolean;
};

export const DownloadButton: React.FC<TDownloadButtonProps> = ({
  exportFormat,
  exportFileName,
  data,
  ...buttonProps
}) => {
  const {showSnackbar} = useSnackbarContext();
  const downloadBtnRef = React.useRef<HTMLAnchorElement | null>(null);

  const downloadContent = () => {
    if (!downloadBtnRef.current)
      return showSnackbar({
        message: 'Download button not found',
        action: <Button onClick={downloadContent}>Retry</Button>,
      });
    downloadBtnRef.current.setAttribute(
      'href',
      `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`,
    );
    downloadBtnRef.current?.setAttribute('download', `${exportFileName}.${exportFormat.toLowerCase()}`);
    downloadBtnRef.current.click();
    showSnackbar({message: 'Download started'});
  };

  return (
    <React.Fragment>
      {buttonProps.withTooltip ? (
        <Tooltip title={`Download as ${exportFormat}`}>
          <Button {...buttonProps} onClick={downloadContent} />
        </Tooltip>
      ) : (
        <Button {...buttonProps} onClick={downloadContent} />
      )}
      <a aria-hidden ref={downloadBtnRef} />
    </React.Fragment>
  );
};
