# db-utils

## Install
```
npm i --save @flexfactory/db-utils
```

## Usage
getPGClient
```javascript
const { getPGClient } = require('@flexfactory/db-utils');

const client = getPGClient({
  database: process.env.DATABASE_NAME,
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
});
```