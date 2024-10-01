import {
  Box,
  type BoxProps,
  Button,
  type ButtonProps,
  CardActions,
  CardContent,
  IconButton,
  type IconButtonProps,
  Card as MuiCard,
  type CardActionsProps as MuiCardActionProps,
  type CardContentProps as MuiCardContentProps,
  type CardProps as MuiCardProps,
  Paper,
  Stack,
  Typography,
  type TypographyProps,
} from '@mui/material';
import React from 'react';

export type TCardHeaderProps = BoxProps & {actions?: React.ReactNode};

const CardHeaderWrapper: React.FC<TCardHeaderProps> = ({children, actions, ...props}) => {
  return (
    <Box {...props} sx={{px: 2, pt: 2, pb: 1, ...props.sx}}>
      <Stack flexDirection={'row'} justifyContent={'space-between'}>
        <Stack>{children}</Stack>

        {actions && (
          <Paper elevation={2} sx={{boxShadow: 'none', border: 'none', height: 'min-content'}}>
            <Stack direction={'row'} justifyContent={'flex-end'}>
              {actions}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export type TCardTitleProps = TypographyProps;

const CardTitle: React.FC<TCardTitleProps> = ({children, ...props}) => {
  return (
    <Typography variant="subtitle1" fontWeight="bold" {...props}>
      {children}
    </Typography>
  );
};

export type TCardSubtitleProps = TypographyProps;

const CardSubtitle: React.FC<TCardSubtitleProps> = ({children, ...props}) => {
  return (
    <Typography variant="subtitle2" {...props}>
      {children}
    </Typography>
  );
};

export type TCardActionProps =
  | ({
      useIconButton: true;
    } & IconButtonProps)
  | ({useIconButton?: false} & ButtonProps);

const CardAction: React.FC<TCardActionProps> = ({useIconButton = false, children, ...props}) => {
  return useIconButton ? (
    <IconButton {...props}>{children}</IconButton>
  ) : (
    <Button {...(props as ButtonProps)}>{children}</Button>
  );
};

export type TCardBodyProps = MuiCardContentProps;

const CardBody: React.FC<TCardBodyProps> = ({children, ...props}) => {
  return (
    <CardContent {...props} sx={{py: 0, ...props.sx}}>
      {children}
    </CardContent>
  );
};

export type TCardFooterProps = MuiCardActionProps;

const CardFooter: React.FC<TCardFooterProps> = ({children, ...props}) => {
  return (
    <CardActions {...props} sx={{px: 2, pb: 2, pt: 1, ...props.sx}}>
      {children}
    </CardActions>
  );
};

export type TCardProps = MuiCardProps;

const Card2: React.FC<TCardProps> & {
  /**
   * CardHeaderWrapper is a React functional component that renders a header section for a card.
   * It accepts children elements to be displayed within the header and optional actions to be
   * displayed on the right side of the header.
   *
   * @param {TCardHeaderProps} props - The properties passed to the component.
   * @param {React.ReactNode} props.children - The content to be displayed within the header.
   * @param {React.ReactNode} [props.actions] - Optional actions to be displayed on the right side of the header.
   * @param {object} [props.sx] - Optional style overrides for the Box component.
   *
   * @returns {JSX.Element} The rendered CardHeaderWrapper component.
   */
  Header: typeof CardHeaderWrapper;
  /**
   * CardTitle component renders a Typography element with a "subtitle1" variant and bold font weight.
   * It accepts all props that a Typography component would accept.
   *
   * @param {TCardTitleProps} props - The properties passed to the CardTitle component.
   * @param {React.ReactNode} props.children - The content to be displayed within the Typography element.
   * @returns {JSX.Element} A Typography element with the specified properties and children.
   */
  Title: typeof CardTitle;
  /**
   * A functional component that renders a subtitle using the Typography component.
   *
   * @component
   * @param {TCardSubtitleProps} props - The properties passed to the component.
   * @param {React.ReactNode} props.children - The content to be displayed inside the subtitle.
   * @returns {JSX.Element} The rendered subtitle component.
   */
  Subtitle: typeof CardSubtitle;
  /**
   * A component that renders either an `IconButton` or a `Button` based on the `useIconButton` prop.
   *
   * @component
   * @param {TCardActionProps} props - The props for the component.
   * @param {boolean} [props.useIconButton=false] - Determines whether to render an `IconButton` or a `Button`.
   * @param {React.ReactNode} props.children - The content to be displayed inside the button.
   * @returns {JSX.Element} The rendered `IconButton` or `Button` component.
   */
  Action: typeof CardAction;
  /**
   * CardBody component is a functional React component that renders its children
   * within a CardContent component. It spreads any additional props onto the
   * CardContent component and merges the sx prop with a default padding-y of 0.
   *
   * @param {TCardBodyProps} props - The properties passed to the CardBody component.
   * @param {React.ReactNode} props.children - The child elements to be rendered inside the CardContent.
   * @param {object} props.sx - The style object to be merged with the default styles.
   *
   * @returns {JSX.Element} The rendered CardContent component with the provided children and props.
   */
  Body: typeof CardBody;
  /**
   * CardFooter component renders the footer section of a card with customizable styles.
   *
   * @param {TCardFooterProps} props - The properties passed to the CardFooter component.
   * @param {React.ReactNode} props.children - The content to be displayed inside the CardFooter.
   * @param {object} props.sx - The style object to customize the appearance of the CardFooter.
   *
   * @returns {JSX.Element} The rendered CardFooter component.
   */
  Footer: typeof CardFooter;
} = ({children, ...props}) => {
  return <MuiCard {...props}>{children}</MuiCard>;
};

Card2.Header = CardHeaderWrapper;
Card2.Title = CardTitle;
Card2.Subtitle = CardSubtitle;
Card2.Action = CardAction;
Card2.Body = CardBody;
Card2.Footer = CardFooter;

export default Card2;
