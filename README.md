# Budget-Buddy Webapp

> The current version of Budget-Buddy of [here](https://budget-buddy.de) avaiable.
> The current version is more of a proof of concept and should see if a custom solution to illustrate my finances will add value to me.
> Therefore I'm working on a less buggy and more functional version in this repo...

More detailed informations about this project can be found in the [wiki](https://github.com/BudgetBuddyDE/Webapp/wiki).

## Content

| Section                          |
| -------------------------------- |
| [Installation](#installation)    |
| [Run with Docker](#docker-setup) |
| [Credits](#credits)              |

## Installation

0. Create an Supabase project. For more steps follow [this](https://supabase.com/docs/guides/examples) guide.

   0. Make sure to setup the database and the RLS policies which are defined in the [Database](https://github.com/BudgetBuddyDE/Webapp/wiki/Database.md)-Guide

1. Create an `.env`-file which stored our Supabase credentials like this
   ```
   REACT_APP_SUPABASE_URL=
   REACT_APP_SUPABASE_ANON=
   ```
2. Install dependencies

   ```shell
   npm i
   ```

   2.1. Setup husky

   > Install husky once in order to run our GIT-hooks If you already have installed the dependencies Husky should already got set-up

   ```shell
   npm run prepare
   ```

   **How to add a hook?**

   ```shell
   npx husky add .husky/pre-commit "npm test"
   git add .husky/pre-commit
   ```

3. Start the app

   ```shell
   npm start
   ```

4. Create an build

   ```shell
   npm run build
   ```

## Docker

**Build an image**

```shell
docker build . -t ghcr.io/budgetbuddyde/wapp:${{ github.ref_name }}
```

**Run the container**

> The app will be reachable under `http://localhost:3000`

```shell
docker run -itd -p 3000:80 --env-file '.env' --restart on-failure:3 --name=budget-buddy-wapp ghcr.io/budgetbuddyde/wapp:<TAG>
```

## Credits

| Name       | Website                 | Usage                       |
| ---------- | ----------------------- | --------------------------- |
| Netlify    | https://netlify.com     | Currently hosted on netlify |
| MaterialUI | https://mui.com         | Frontend component library  |
| Supabase   | https://supabase.io     | Auth & Backend Provider     |
| Netlify    | https://netlify.app     | Hosting                     |
| AirBnB     | https://airbnb.io/visx/ | Chart Library               |
