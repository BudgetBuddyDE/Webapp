# Webapp

> [!NOTE]  
> Hosted on **[Vercel](https://vercel.com/)**

|                                                 Prod                                                 |                                                   Dev                                                    |
| :--------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------: |
| [![](https://status.tklein.it/api/badge/12/status?style=for-the-badge)](https://app.budget-buddy.de) | [![](https://status.tklein.it/api/badge/23/status?style=for-the-badge)](https://dev.app.budget-buddy.de) |

## Getting started

### Dev-Environment

> [!NOTE]  
> Make sure to have the [Backend](https://github.com/BudgetBuddyDE/Backend) running and the database set up. For more information about database setup look into [this](https://github.com/BudgetBuddyDE/setup) repository

1. Clone the repo

   ```bash
   git clone git@github.com:BudgetBuddyDE/Webapp.git
   cd Webapp/
   ```

2. Install all required dependencies

   ```bash
   npm install
   ```

3. Start the application

   ```bash
   npm run dev
   npm run dev --host # if you want to expose it to your network
   ```

### Docker-Compose

> [!NOTE]  
> You can find an pre-defined `compose.yml` in the [Setup-Repository](https://github.com/BudgetBuddyDE/setup.git) which also contains the instructions for the setup-process
