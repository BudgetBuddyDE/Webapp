import {BookmarkBorderRounded, BookmarkRounded, SendRounded} from '@mui/icons-material';
import {Box, Checkbox, Grid, IconButton, TextField, Typography} from '@mui/material';
import OpenAI from 'openai';
import React from 'react';

import {withAuthLayout} from '@/components/Auth/Layout';
import {LabelBadge} from '@/components/Base';
import {Feature, withFeatureFlag} from '@/components/Feature';
import {ContentGrid} from '@/components/Layout';

/**
 * Array of predefined questions for the assistant based on your financial wellbeing.
 */
const PredefinedQuestions = [
  {
    headline: 'How much do I spend on...',
    description: 'Learn how much you spend on different categories.',
    prompt: 'Can you tell me how much I spent on X last month?',
  },
  {
    headline: 'How much do I save each month?',
    description: 'Please provide the amount you save each month.',
    prompt: 'PROVIDE AN EXAMPLE PROMPT HERE',
  },
];

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: process.env.OPEN_AI_KEY,
});
const model = 'gpt-3.5-turbo';

export type TAdditionalData =
  | 'transactions'
  | 'subscriptions'
  | 'budgets'
  | 'categories'
  | 'payment_methods'
  | 'stock_positions';

const AdditionalData: {label: string; value: TAdditionalData}[] = [
  {label: 'Transactions', value: 'transactions'},
  {label: 'Subscriptions', value: 'subscriptions'},
  {label: 'Budgets', value: 'budgets'},
  {label: 'Categories', value: 'categories'},
  {label: 'Payment Methods', value: 'payment_methods'},
  {label: 'Stock Positions', value: 'stock_positions'},
];

export const Assistant = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<{sender: 'BOT' | 'ME'; message: string}[]>([]);
  const [additionalData, setAdditionalData] = React.useState<Record<TAdditionalData, boolean>>({
    transactions: false,
    subscriptions: false,
    budgets: false,
    categories: false,
    payment_methods: false,
    stock_positions: false,
  });

  const test = async (messages: typeof chatHistory) => {
    try {
      if (Object.values(additionalData).some(Boolean)) {
        const a = Object.entries(additionalData)
          .filter(([, value]) => value)
          .map(([key, value]) => value && key);
        console.log('additiona data:', a);
      }

      // const completion = await openai.chat.completions.create({
      //   messages: messages.map(({sender, message}) => {
      //     return {
      //       role: sender === 'BOT' ? 'system' : 'user',
      //       content: message,
      //     };
      //   }),
      //   temperature: 0.5,
      //   model: model,
      //   n: 1,
      // });
      // // console.log('openai response:', completion);
      // const choices = completion.choices;
      // const lastChoice = choices[choices.length - 1];
      // setChatHistory(prev => [
      //   ...prev,
      //   {sender: 'BOT', message: lastChoice.message.content ?? "I'm sorry, I cannot respond to that."},
      // ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handler = {
    submitPrompt: async (prompt: string) => {
      if (prompt.length === 0) return;
      setIsLoading(true);

      const updatedChat: typeof chatHistory = [...chatHistory, {sender: 'ME', message: prompt}];
      setChatHistory(updatedChat);
      await test(updatedChat);
      setIsLoading(false);
      // setChatHistory(prev => [...prev, {sender: 'ME', message: prompt}]);
      // setTimeout(async () => {
      //   setChatHistory(prev => [
      //     ...prev,
      //     {sender: 'BOT', message: 'I am currently under development and cannot respond.'},
      //   ]);
      //   setIsLoading(false);
      // }, 1000);
    },
  };

  return (
    <ContentGrid
      title={'AI Assistant'}
      description={'Say hello to your personal assistant!'}
      justifyContent={'center'}
      sx={{height: '100%'}}>
      <Grid container item xs={12} md={8} lg={7} rowSpacing={2}>
        {chatHistory.map(({sender, message}) => (
          <Grid item xs={10} sx={{ml: sender === 'BOT' ? 'unset' : 'auto'}}>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}>
              {message}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container item xs={12} md={8} lg={7} spacing={2} sx={{mt: 'auto'}}>
        {!isLoading &&
          Object.entries(chatHistory).length === 0 &&
          PredefinedQuestions.map(({headline, description, prompt}) => (
            <Grid key={headline.replaceAll(' ', '_').toLowerCase()} item xs={12} md={6} lg={6}>
              <Box
                sx={{
                  border: 1,
                  borderRadius: theme => theme.shape.borderRadius + 'px',
                  p: 2,
                  borderColor: 'divider',
                  ':hover': {
                    borderColor: 'primary.main',
                    cursor: 'pointer',
                  },
                }}
                // onClick={() => handler.submitPrompt(prompt)}
                onClick={() => setPrompt(prompt)}>
                <Typography variant="body1" fontWeight={'bolder'}>
                  {headline}
                </Typography>
                <Typography variant="body2">{description}</Typography>
              </Box>
            </Grid>
          ))}

        <Grid item xs={12}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handler.submitPrompt(prompt);
              setPrompt('');
            }}>
            <Box>
              {AdditionalData.map(({label, value}) => (
                <Checkbox
                  key={value}
                  icon={<LabelBadge color="warning">{label}</LabelBadge>}
                  checkedIcon={<LabelBadge color="primary">{label}</LabelBadge>}
                  sx={{borderRadius: 'unset', p: 0}}
                  onClick={() => setAdditionalData(prev => ({...prev, [value]: !prev[value]}))}
                />
              ))}
            </Box>
            <TextField
              placeholder="How can I help you?"
              multiline
              fullWidth
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              helperText="Assistant is currently under development and can deliver faulty responses."
              FormHelperTextProps={{sx: {textAlign: 'center', fontWeight: 'unset', mt: 1}}}
              InputProps={{
                endAdornment: (
                  <IconButton disabled={isLoading} type="submit">
                    <SendRounded />
                  </IconButton>
                ),
              }}
              disabled={isLoading}
              // onChange={e => handler.submitPrompt(e.target.value)}
            />
          </form>
        </Grid>
      </Grid>
    </ContentGrid>
  );
};

export default withFeatureFlag(Feature.AI_ASSISTANT, withAuthLayout(Assistant), true);

// import OpenAI from 'openai';

// const openai = new OpenAI();

// async function main() {
//   const stream = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [{ role: 'user', content: 'Say this is a test' }],
//     stream: true,
//   });
//   for await (const chunk of stream) {
//     process.stdout.write(chunk.choices[0]?.delta?.content || '');
//   }
// }

// main();
