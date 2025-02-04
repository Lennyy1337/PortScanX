# Immuta Serverside backend

Hey! Welcome to the Immuta SS Backend!
Written by lenny.

This project uses pnpm.

# Setup

To set this backend up, you will need to create a postgres database, copy the .env and fill it with data.

Database_url is the url of the postgres db.\
JWT_secret_key can be anything that you want (use a online password generator or press random keys)\
JWT_issuer can be anything\

# .env

```.env
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ISSUER=
logwebhookURL=
```

# Installing dependencies

To install all dependencies, run `pnpm add`

# Building

To build, run `pnpm build`

# Starting

To start, run `pnpm start`