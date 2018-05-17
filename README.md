# Full Screen Social Media Graphics

![Screenshot](https://image.ibb.co/kgdAoy/Screen_Shot_2018_05_17_at_09_55_51.png "Screenshot")

## Setting background image

Navigate to /public/images/ and overwrite ```background.png``` with an of the same resolution as your output (for example, 1280x720, 1920x1080. Whether the image is used is controlled in the backend. 

## Launching 

### Windows
Double click
```
./startup.bat
```

### Linux / Mac
Run from the directory this readme is in:
```
npm install
node server.js
```

## Using

You MUST add some Twitter API credentials, as Twitter requires this. Get these at https://apps.twitter.com/ (Signup for a new app, it can be named anything etc.) by clicking on Keys and Access Tokens. Head to ```server.js``` and pop down to line number 26. Copy across the four required acccess codes then restart your server if you've already started it. 

For the [admin](http://127.0.0.1:3002/admin) page, navigate to http://127.0.0.1:3002/admin

For the [graphics](http://127.0.0.1:3002) output, navigate to http://127.0.0.1:3002

See instructions in the Live Control area. 
