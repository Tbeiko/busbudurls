# README

## URL Shortner for Busbud

This is my first project using NodeJS and Redis. 
It is a simple URL shortener for Busbud. 

The core of this was built with the help of Matthew Daly's tutorial, which can be found at [busb.co/tutorial](http://busb.co/tutorial)

Users can pass in a URL and an optional slug. 
A key-value Redis element will then be created using the shortened URL `id` as key and the `url` as value.
If `url` does not begin with either "ftp://", "ftps://", "http://" or "https://", "http://" will be added at its beginning.

If the user pases in a custom slug, it will check whether the slug is already used for another `url` or not.
If so, it will generate a random `id` using `shortid`. 
If not, the custom slug will become the `id`. 

### TODO
1. Make it look somewhat decent
  - ~~add bootstrap~~
  - mobile responsive
  - help text under proper box
  - ~~style it~~ 
1. ~~Add custom (short) domain~~
  - ~~`heroku config:set BASE_URL="shortdoma.in"`~~
  - ~~Make it work without www~~
1. ~~Update form to not require `"http://"` at beginning of link~~
1. ~~Add option for custom slug~~
  ~~- Will need validations in case slug exists~~
1. ~~Handle empty URLs~~
1. Rework tests
  - original tests are passing on localhost, but need to validate with real URLs
  - create tests for:
    1. http:// or no http://
    1. slug, no slug, pre-existant slug
1. Handle non-URL text (e.g. "Hi, my name is Tim")
1. Require log in
1. Copy link to clipboard automatically
1. Show list of currently used slugs
