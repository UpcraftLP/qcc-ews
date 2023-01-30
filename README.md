# Quilt Community Collab EWS
A Discord Bot that acts as an Early Warning System for the Quilt Community Collab

<br>

![](.media/showcase.webp)

<br>

## How to use:

For convenience, this application is packaged as a Docker image.<br>
The bot can be configured using [environment variables](.env.example)
```sh
$ docker pull ghcr.io/upcraftlp/quilt-ews:main
```

## Contributing:

1. Install [Yarn](https://classic.yarnpkg.com/en/docs/install "Yarn package manager")
2. Clone the repository
    ```sh
    $ git clone https://github.com/upcraftlp/quilt-ews.git
    $ cd quilt-ews
    ```
3. Install dependencies
    ```sh
    $ yarn
    ```
4. On the Create a new Discord [application](https://discord.com/developers/applications "Discord developer dashboard") and bot user
5. ❗enable the `SERVER MEMBERS INTENT` toggle in the bot's settings❗
6. To invite the bot to your server, you need to open the invite link in your browser:<br>
    *replace `YOUR_CLIENT_ID` with the application ID from the dashboard*
    ```
    https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=0&scope=bot
    ```
7. Set up the environment (see [the example file](.env.example))
8. Run the bot in development mode
    ```sh
    $ yarn dev
    ```