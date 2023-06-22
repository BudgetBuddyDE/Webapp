import { Link, Typography } from '@mui/material';
import React from 'react';

const URL_REGEX =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

export const Linkify: React.FC<React.PropsWithChildren> = ({ children }) => {
    const id = React.useId();
    if (typeof children !== 'string') {
        throw new Error('Provided children should be a String');
    }
    return (
        <Typography>
            {children.split(' ').map((word, index) => {
                return word.match(URL_REGEX) ? (
                    <React.Fragment key={id + index}>
                        <Link href={word.includes('//') ? word : '//' + word} underline="none">
                            {word}
                        </Link>{' '}
                    </React.Fragment>
                ) : (
                    word + ' '
                );
            })}
        </Typography>
    );
};
