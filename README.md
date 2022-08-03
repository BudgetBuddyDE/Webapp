# Budget-Buddy Webapp

> The current version of Budget-Buddy of [here](https://budget-buddy.de) avaiable.
> The current version is more of a proof of concept and should see if a custom solution to illustrate my finances will add value to me.
> Therefore I'm working on a less buggy and more functional version in this repo...

## Installation

0. Create an Supabase project. For more steps follow [this](https://supabase.com/docs/guides/examples) guide.

1. Create an `.env`-file which stored our Supabase credentials like this
   ```
   REACT_APP_SUPABASE_URL=
   REACT_APP_SUPABASE_ANON=
   ```
2. Install dependencies

   ```shell
   npm i
   ```

3. Start the app

   ```shell
   npm start
   ```

4. Create an build

   ```shell
   npm run build
   ```

## Database

We're running an PostgreSQL database provided by [Supabase](https://supabase.io).

### Tables

#### Profiles

##### Table

|    Column    |     Type     | Description |
| :----------: | :----------: | ----------- |
|     `id`     |    `uuid`    |             |
|  `username`  |    `text`    |             |
| `updated_at` | `timestampz` |             |

##### SQL

```sql
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);
```

##### Policies

###### Enable

```sql
alter table profiles
  enable row level security;
```

###### Read

```sql
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);
```

###### Create

```sql
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);
```

###### Update

```sql
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);
```

---

## Credits

| Name       | Website                 | Usage                      |
| ---------- | ----------------------- | -------------------------- |
| MaterialUI | https://mui.com         | Frontend component library |
| Supabase   | https://supabase.io     | Auth & Backend Provider    |
| Netlify    | https://netlify.app     | Hosting                    |
| AirBnB     | https://airbnb.io/visx/ | Chart Library              |
