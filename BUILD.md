# Project Development

### Setup
The [http-server](https://github.com/http-party/http-server) is used for local development and manual testing.

To install http-server (globally):
```
npm install --global http-server
```

To setup local directory structure
```
# Windows commands
cd <project-dir>
mkdir ..\http-server.public
mklink /J ..\http-server.public\calendar .
```
OR
```
# Linux/Unix commands
cd <project-dir>
mkdir -p ../http-server.public
ln ./ ../http-server.public/calendar/
```

### Running locally
```
http-server ../http-server.public/ -c-1 -p 9088

# then, open http://localhost:9088/calendar/index.html
```

### Deploy / Publish
1. Push the changes to remote (`git@github.com:JohnWu-Pro/calendar.git`).
2. Open https://johnwu-pro.github.io/calendar/index.html?v=123.
   * NOTE: Using `?v=<random-number>` to workaround issues caused by page `index.html` caching.
