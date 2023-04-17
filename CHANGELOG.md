# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.3](https://github.com/BudgetBuddyDE/Webapp/compare/v0.2.2...v0.2.3) (2023-04-17)


### Features

* Add `AppBar`-component ([b003a62](https://github.com/BudgetBuddyDE/Webapp/commit/b003a621199ed4affa36afa9158bbe4dbca41f66))
* Add `Brand`-component ([9b1fc10](https://github.com/BudgetBuddyDE/Webapp/commit/9b1fc100ed8b11ccda014aa92a9aa3836da77c4c))
* Add `CreateFab` ([98935d7](https://github.com/BudgetBuddyDE/Webapp/commit/98935d7fc2f271a4d7023aec295826e46ba264b4))

### [0.2.2](https://github.com/BudgetBuddyDE/Webapp/compare/v0.2.1...v0.2.2) (2023-04-17)


### Bug Fixes

* Improve match-rate for filtering ([f145f27](https://github.com/BudgetBuddyDE/Webapp/commit/f145f27c4f9d3b0088b55edf40eba695337a91da))
* Re-implement feature ([04b5556](https://github.com/BudgetBuddyDE/Webapp/commit/04b555622318f8edc0262fd756917c20a90bd2b7))

### [0.2.1](https://github.com/BudgetBuddyDE/Webapp/compare/v0.2.0...v0.2.1) (2023-04-16)


### Features

* Create category from option ([cbe4479](https://github.com/BudgetBuddyDE/Webapp/commit/cbe4479378543f641f590212049a7045bdb1ad18))
* Create payment-method from option ([65665e5](https://github.com/BudgetBuddyDE/Webapp/commit/65665e5e1e0b5caed33d8614aeccb9dbe1eb3a82))


### Bug Fixes

* Don't display arcs with an value of 0 ([786559a](https://github.com/BudgetBuddyDE/Webapp/commit/786559a8749b8f493fe23103c82eec91c3df99ad))
* Refetch data after relevant changes ([97d01f1](https://github.com/BudgetBuddyDE/Webapp/commit/97d01f153f18b32fe46dfa2fd2db8f14ebb5e73f))

## [0.2.0](https://github.com/BudgetBuddyDE/Webapp/compare/v0.1.0...v0.2.0) (2023-03-02)


### ⚠ BREAKING CHANGES

* Refetch when new user

### Features

* Add clickable category-chip ([43ee721](https://github.com/BudgetBuddyDE/Webapp/commit/43ee72106dc83150c1a958a147ae5c09348a7742))


### Bug Fixes

* Clear state after closing the drawer ([e411ae1](https://github.com/BudgetBuddyDE/Webapp/commit/e411ae1b59472de61deab213bf84656b6a101115))
* Clear user-specific-states when signed-out ([0c10755](https://github.com/BudgetBuddyDE/Webapp/commit/0c10755ec978080aa6c8616286e1d98ea195551b))
* Make icon/badge clickable ([ecd9e38](https://github.com/BudgetBuddyDE/Webapp/commit/ecd9e38534250ac4f4edf9c25bbf225932a90326))
* Move `onClick`-listener to correct component ([079f779](https://github.com/BudgetBuddyDE/Webapp/commit/079f7798cb55ea68e0592ed29b0f8955b87033df))
* Re-fetch data when `dateRange` gets changed ([75d31ae](https://github.com/BudgetBuddyDE/Webapp/commit/75d31aea091ce1b170eb7b50e0a584ca303af851))
* Refetch when new user ([48889ae](https://github.com/BudgetBuddyDE/Webapp/commit/48889ae12a8551669f3a22bee64ded5b9dda26be))

## [0.1.0](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.10...v0.1.0) (2023-02-28)


### ⚠ BREAKING CHANGES

* Create custom-reducer for budget-route data
* Store remaining dashboard-data in `StoreContext`
* Add hook for fetching payment-methods
* Add hook for fetching categories
* Add hook for fetching subscriptions
* Add hook for fetching transactions
* Apply new reducer-concept on budget
* Apply new reducer-concept on subscriptions
* Apply new reducer-concept on payment-methods
* Apply new reducer-concept on categories
* Introduce new construct for data-storing/fetching

### Features

* Apply new reducer-concept on categories ([37b2442](https://github.com/BudgetBuddyDE/Webapp/commit/37b24426a5e65605ff92f1b7f4589e18f892f0af))
* Introduce new construct for data-storing/fetching ([e485da1](https://github.com/BudgetBuddyDE/Webapp/commit/e485da17effa48679122769722e9603af2eec79f))
* Show warning msg ([00123b0](https://github.com/BudgetBuddyDE/Webapp/commit/00123b0158b9526e6916334be3a83e00fdea9a3c))


### Bug Fixes

* Use correct loading-state ([3d1d655](https://github.com/BudgetBuddyDE/Webapp/commit/3d1d6550b1a2e7bdf24f82a679488f896f057963))


* Add hook for fetching categories ([de70895](https://github.com/BudgetBuddyDE/Webapp/commit/de70895452f6f8a0c5d754904cb7a7075a9c3308))
* Add hook for fetching payment-methods ([634dfa4](https://github.com/BudgetBuddyDE/Webapp/commit/634dfa41d2d94b048aabe57da64727e8560a05be))
* Add hook for fetching subscriptions ([d28172c](https://github.com/BudgetBuddyDE/Webapp/commit/d28172ceb17b0b4375bb89e5199c7e7258b50d71))
* Add hook for fetching transactions ([e563b15](https://github.com/BudgetBuddyDE/Webapp/commit/e563b15dbe12b3986c4ef1e52ce497af6bb71d58))
* Apply new reducer-concept on budget ([7c2c9f8](https://github.com/BudgetBuddyDE/Webapp/commit/7c2c9f8592105e56b630c90b63f7aa84363e50f8))
* Apply new reducer-concept on payment-methods ([766e03c](https://github.com/BudgetBuddyDE/Webapp/commit/766e03c7dbf6827aaa51c0d85c30c06471c3e3c3))
* Apply new reducer-concept on subscriptions ([efae2a2](https://github.com/BudgetBuddyDE/Webapp/commit/efae2a2739bf48fe16648d48a2722c7175f3207a))
* Create custom-reducer for budget-route data ([1ee6be8](https://github.com/BudgetBuddyDE/Webapp/commit/1ee6be879eb123a9d7605e70ff461337f0a5b3aa))
* Store remaining dashboard-data in `StoreContext` ([fd25987](https://github.com/BudgetBuddyDE/Webapp/commit/fd259876c1659f214f66966cc609b4132ff9e9e3))

### [0.0.10](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.9...v0.0.10) (2023-02-25)


### Features

* Add charts for general informations ([67ee67c](https://github.com/BudgetBuddyDE/Webapp/commit/67ee67cb3cc6807e471993609c1318928c2e7eb3))
* Add charts for general stats ([c7cb8d7](https://github.com/BudgetBuddyDE/Webapp/commit/c7cb8d78dd55b2c9741cdb28981f2b4a616a4264))
* Add RPC for retrieving stats ([7f170ce](https://github.com/BudgetBuddyDE/Webapp/commit/7f170cef15ab0bd76505603bc1525eaae87a7ae2))


### Bug Fixes

* Apply filters from chips ([7447ece](https://github.com/BudgetBuddyDE/Webapp/commit/7447ece5910afc38919a118533b9744429da6f80))
* Get data from the past 12 months by default ([37757fc](https://github.com/BudgetBuddyDE/Webapp/commit/37757fc3e5c5195775db9dfcc8d1d4171208f392))

### [0.0.9](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.8...v0.0.9) (2023-02-23)


### Features

* Add `<PieChart />`-component ([60fae9c](https://github.com/BudgetBuddyDE/Webapp/commit/60fae9cdec83810042d216d6b0e9a204436b86ac))
* Add chart for displaying category-stats ([c072ec8](https://github.com/BudgetBuddyDE/Webapp/commit/c072ec8574c749ffd824fab18dcc230d0fed0b73))
* Add charts for detailed statistics ([bc31175](https://github.com/BudgetBuddyDE/Webapp/commit/bc311755f22443f5f8aedd53a9c53d5a04693456))
* Add pie-chart ([857ab66](https://github.com/BudgetBuddyDE/Webapp/commit/857ab66e64b20fde5d30888afc5025f42e0a34e9))
* Only format when wanted ([b51c8bc](https://github.com/BudgetBuddyDE/Webapp/commit/b51c8bcd2a793d510b7b5a0748d9cf4bb535b7ce))


### Bug Fixes

* Set `description` to `null` when not given ([83dd8ef](https://github.com/BudgetBuddyDE/Webapp/commit/83dd8ef7164a1d93ce01a374b1b7e3a30974af9f))

### [0.0.8](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.7...v0.0.8) (2023-02-12)

### Features

- Display message when no data set ([dfb46cb](https://github.com/BudgetBuddyDE/Webapp/commit/dfb46cbc9fd0af42e79e90b1cf8097939d007926))
- Use `<BarChart />` for daily-transactions ([735eaf3](https://github.com/BudgetBuddyDE/Webapp/commit/735eaf3bbdfc6266de255ede0906de73c32721d7))

### Bug Fixes

- Add missing folders ([0a0c4f2](https://github.com/BudgetBuddyDE/Webapp/commit/0a0c4f2be9d5d4f1ec1881ce026128a7adae7965))
- Delete folder ([0532053](https://github.com/BudgetBuddyDE/Webapp/commit/0532053744d877b2b6c09cb180a918f3c0c80a7e))
- Solve 'Cannot find name FC' ([1ecef25](https://github.com/BudgetBuddyDE/Webapp/commit/1ecef2526b2d8ed089b579f95919b4b6b7e4da4c))

### [0.0.7](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.6...v0.0.7) (2023-02-04)

### Features

- Add estimated balance ([a845f4d](https://github.com/BudgetBuddyDE/Webapp/commit/a845f4d770841cdf3af40754326cdb82e1b190ac))
- Add onClick-listener for chips ([f4023dc](https://github.com/BudgetBuddyDE/Webapp/commit/f4023dc5f84386a32d8ebcb87e5a47afdee26f60))
- Display username & avatar(when set) ([ea3105f](https://github.com/BudgetBuddyDE/Webapp/commit/ea3105f2becbe63dd5313e53cd6ff526f934f31e)), closes [Webapp#16](https://github.com/BudgetBuddyDE/Webapp/issues/16)
- **feedback:** Make feedback shareable and anonymus ([d5ec506](https://github.com/BudgetBuddyDE/Webapp/commit/d5ec506cded869270755b72b308789235fef8845))
- Linkify urls in text ([c4e5fd7](https://github.com/BudgetBuddyDE/Webapp/commit/c4e5fd7d2c4a2aecc9c123a8ca2d3c94765fdd83))
- Provide upload of custom user avatars ([b8a48f8](https://github.com/BudgetBuddyDE/Webapp/commit/b8a48f8a003ddb8cd6e6c251011aaf957fc50ac6))

### Bug Fixes

- Add missing event-handlers ([c574063](https://github.com/BudgetBuddyDE/Webapp/commit/c57406310913d9408d854f917f114a648e87dc36))
- Add proper spacing ([93097a2](https://github.com/BudgetBuddyDE/Webapp/commit/93097a293e9c2952d20b59bdc7486300f0048c70))
- Set correct heading for component ([bda99cb](https://github.com/BudgetBuddyDE/Webapp/commit/bda99cb46ea5f407429f9bebdeb57ca9c11a3efa))
- Use correct path ([11d7b35](https://github.com/BudgetBuddyDE/Webapp/commit/11d7b357beaac9f832ce034478008fbadc3f2432))
- Use unique key for mapping ([694bac4](https://github.com/BudgetBuddyDE/Webapp/commit/694bac40c46d8e4eb3cad6fd608fa7bafd7b7eb3))

### [0.0.6](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.5...v0.0.6) (2022-10-27)

### Features

- Add `<NoResults />`-component ([2519a73](https://github.com/BudgetBuddyDE/Webapp/commit/2519a73e3213e93bdbf97dd09f5af9a8c3130b77))
- Add `info` option to `<StatsCard />` ([3938cf3](https://github.com/BudgetBuddyDE/Webapp/commit/3938cf3547d142beef352d051e99c8def26fcc8d))
- Add `Settings`-route ([3c87635](https://github.com/BudgetBuddyDE/Webapp/commit/3c87635f0ad454dec8d9885044f11255fcdda6d4))
- Add `useState`-hooks with callback ([cfc956f](https://github.com/BudgetBuddyDE/Webapp/commit/cfc956f9647bc418d619449ecab943ccc66faf3a))
- Add filter-drawer for setting and applying content filters ([7ca6e65](https://github.com/BudgetBuddyDE/Webapp/commit/7ca6e65efd9b5665d49236c539f7648cd53a74e7))
- Add form-drawer for subscriptions and transactions ([1e05e36](https://github.com/BudgetBuddyDE/Webapp/commit/1e05e36fa0e6d4dcda556b76ac0bc779b13a8a8d))
- Add JSON and CSV data export ([9acb3ed](https://github.com/BudgetBuddyDE/Webapp/commit/9acb3ed1db0d1dcf03167b503d4f7e96574cbe75))
- Add optional transactions to process ([d16f037](https://github.com/BudgetBuddyDE/Webapp/commit/d16f0370a216f19a999421fbd9e64ee81219cc95))
- Allow `sx`-props for card-components ([7ad2726](https://github.com/BudgetBuddyDE/Webapp/commit/7ad27260a61270bc644113eb378d4ca4142c551a))
- Apply filters on subscription-route ([c44ef99](https://github.com/BudgetBuddyDE/Webapp/commit/c44ef999778397c7f2d90ad36ab58dfb37f192ea))
- Apply filters on transactions-route ([3d705b7](https://github.com/BudgetBuddyDE/Webapp/commit/3d705b7a3faf3f9b6a8efaaa3f44da095f9dbae9))
- Complete first draft of budget ([73f601b](https://github.com/BudgetBuddyDE/Webapp/commit/73f601b4be6e6e1dd6ca8f103343b46a9a40bfa2))
- Display actuall data ([7e1c4e7](https://github.com/BudgetBuddyDE/Webapp/commit/7e1c4e7f582fa4c5293f1f3387e5b4d2670598dc))
- Soft subscriptions by next execution date ([4c1f25d](https://github.com/BudgetBuddyDE/Webapp/commit/4c1f25dbd3f49c2ad8ee95ac1eb70de207ea6381))
- Solve [#6](https://github.com/BudgetBuddyDE/Webapp/issues/6) ([80105c6](https://github.com/BudgetBuddyDE/Webapp/commit/80105c64707bf4b1f1578a15596fe4a9dd2d242d))
- Update dashboard-cards ([802b4fa](https://github.com/BudgetBuddyDE/Webapp/commit/802b4fa669e84d59a7ac3392e4fc5c88d7167659))

### Bug Fixes

- (TEMP) Disable input type ([39c2c70](https://github.com/BudgetBuddyDE/Webapp/commit/39c2c70459246bb74c6b7aa3cd2b94163a93be39))
- [#9](https://github.com/BudgetBuddyDE/Webapp/issues/9) Use correct key ([ef365f7](https://github.com/BudgetBuddyDE/Webapp/commit/ef365f79071ea0fdd3053e676795b425c05f5052))
- Add future transaction to upcoming payments ([e30099c](https://github.com/BudgetBuddyDE/Webapp/commit/e30099c60d7012edb38c599b9b2d45c67929b3af))
- Add future transaction to upcoming payments ([853b1e8](https://github.com/BudgetBuddyDE/Webapp/commit/853b1e8c0b0319de83fdf85ad908f40190605b2c))
- Apply `display: flex;` on order to provide desired layout ([dd1cde1](https://github.com/BudgetBuddyDE/Webapp/commit/dd1cde18e402a6af56d825821772c055b66a933e))
- Don't filter when array is empty ([ca10313](https://github.com/BudgetBuddyDE/Webapp/commit/ca10313fd63a899ec2c98bae762ff379d6c87a68))
- Don't require description ([c121004](https://github.com/BudgetBuddyDE/Webapp/commit/c121004764b3ccb04f16cf3502fabd21fa815051))
- Dont require an id for category creation ([525e04d](https://github.com/BudgetBuddyDE/Webapp/commit/525e04da67a78e4e466df9e1a08c27f9ff90538d))
- Only compare dates without time ([b536efa](https://github.com/BudgetBuddyDE/Webapp/commit/b536efa8d0912d44eccb2976531316f8166176e4))
- Open drawer on button-click ([258f0c0](https://github.com/BudgetBuddyDE/Webapp/commit/258f0c0aba01432f43cbdda58e13ece80d783f47))
- Refresh expenses after adding data ([78544b6](https://github.com/BudgetBuddyDE/Webapp/commit/78544b6695a42563695dc5639fcfa30e4aaf4c5c))
- Remove `pattern`-argument from input ([854d8ad](https://github.com/BudgetBuddyDE/Webapp/commit/854d8ad624551b18bb82044c55520557a6b9ed52))
- Return `<Naviagte />`-component in order to prevent crashes ([29aa23b](https://github.com/BudgetBuddyDE/Webapp/commit/29aa23bc5ec4859b61277b71872b7c59259c398a))
- Solve `undefined` for categories and payment-methods ([a016d9b](https://github.com/BudgetBuddyDE/Webapp/commit/a016d9b9a7ee4cf705b1942723ef454226ad7c61))
- Solve undefined for `addForm.execute_at` ([46cd1ea](https://github.com/BudgetBuddyDE/Webapp/commit/46cd1eaa6e40969a90188a87eecb9bab433654eb))
- Use correct input-mode for the form ([44c91bc](https://github.com/BudgetBuddyDE/Webapp/commit/44c91bc6d6a1a0b2373b1c54c3e207e7b30c946e))
- Use correct keys and names for forms and state ([5cdbb81](https://github.com/BudgetBuddyDE/Webapp/commit/5cdbb8176998f7cededa24d7e1a93cfec9b033db))
- Use correct method to create category ([79147ea](https://github.com/BudgetBuddyDE/Webapp/commit/79147ea69c08f380ce3a8b3b721409477234ba5f))

### [0.0.5](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.4...v0.0.5) (2022-08-11)

### Features

- Add password-reset using Supabase ([385bcb4](https://github.com/BudgetBuddyDE/Webapp/commit/385bcb487f3f6eab62f0af5d03a15480096c8a70))

### [0.0.4](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.3...v0.0.4) (2022-08-10)

### Features

- Save drawer state ([4ad615d](https://github.com/BudgetBuddyDE/Webapp/commit/4ad615d4cf03a75db8660eab22f2bd174d8f0e60))

### [0.0.3](https://github.com/BudgetBuddyDE/Webapp/compare/v0.0.2...v0.0.3) (2022-08-10)

### Features

- Add categories ([b5e133c](https://github.com/BudgetBuddyDE/Webapp/commit/b5e133c12cbee58ca55b72f8912162d80d74b564))
- Add page for transactions ([9ee8f34](https://github.com/BudgetBuddyDE/Webapp/commit/9ee8f3415d43702af504259cb73c6553ca647261))
- Add subscriptions ([7b0d0ca](https://github.com/BudgetBuddyDE/Webapp/commit/7b0d0ca317b815f16d7f82415bc6a770230cff3c))
- Create `FormDrawer` ([71be504](https://github.com/BudgetBuddyDE/Webapp/commit/71be50407f8febe656986882a0d4b8948e619b84))
- Make payment-methods editable & editable ([a486bb8](https://github.com/BudgetBuddyDE/Webapp/commit/a486bb8b621551babcae7220bff96f1842006b4e))
- Make transactions editable ([2c2ba30](https://github.com/BudgetBuddyDE/Webapp/commit/2c2ba3017ddb3bd8d093d19403bdfa7494176d32))

### Bug Fixes

- Rename attribute of `ICategory` ([4586660](https://github.com/BudgetBuddyDE/Webapp/commit/45866602a63db45390509579165cf7e63bd65013))
- Wrap content when there isn't enough space ([6aa2b1f](https://github.com/BudgetBuddyDE/Webapp/commit/6aa2b1f68931f3347f74e1eeaac62ba224d0c9a3))

### 0.0.2 (2022-08-03)

### Features

- Add card-component ([b6f7368](https://github.com/BudgetBuddyDE/Webapp/commit/b6f7368d47db2b8e532930a6732a3d61eb70db82))
- Add dashboard ([987192e](https://github.com/BudgetBuddyDE/Webapp/commit/987192e8cc7f9b53b6edd1a10a4cb2d54041333c))
- Add drawer ([88fd689](https://github.com/BudgetBuddyDE/Webapp/commit/88fd68951fd7e92660e7125f40ea40540aa63300))
- Add payment-methods ([61bbafa](https://github.com/BudgetBuddyDE/Webapp/commit/61bbafaff790f885e7aedc1e79a6d63dcccbf906))
- Add search-input component ([b94eaeb](https://github.com/BudgetBuddyDE/Webapp/commit/b94eaebe17ccd1ec31527db21c085db88adea85f))
- Create `DateService` to get current month as string ([efa6994](https://github.com/BudgetBuddyDE/Webapp/commit/efa69949fa7872ebfcc0a0ca10c03ddcf591bad3))

### Bug Fixes

- Change `Drawer`-width ([9a9f7a4](https://github.com/BudgetBuddyDE/Webapp/commit/9a9f7a4e3c71d486c569ca4937412d8e0e5aa7c1))
- Check if email is set ([e9635f2](https://github.com/BudgetBuddyDE/Webapp/commit/e9635f29ecdb9f5290a92803319f74a9ae0eee8b))
- Redirect to dashboard ([4510726](https://github.com/BudgetBuddyDE/Webapp/commit/4510726df462606c8771266ffe671981206a2262))
