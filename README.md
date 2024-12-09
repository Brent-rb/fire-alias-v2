[![Badge Commits]][Commit Rate]
[![Badge Issues]][Issues]
[![Badge License]][License]
[![Badge Mozilla]][Mozilla]
[![Badge Chrome]][Chrome]

<h1 align="center">
    <sub>
    <img src="./public/icon.png" height="38" width="38">
    </sub>
    FireAlias
</h1>

<p align="center">
<a href="https://addons.mozilla.org/addon/firealias/">
    <img 
        src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Get FireAlias for Firefox"
    >
</a>
<a href="https://chromewebstore.google.com/detail/firealias/kkdiecfcjiijbplpjjjipgiebcimeokd">
    <img 
        src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Get FireAlias for Chromium"
    >
</a>
</p>

FireAlias is a lightweight and intuitive browser addon for Firefox and Chrome that makes navigating to your favorite websites faster and easier than ever before. By creating custom aliases for your favorite websites, FireAlias makes it easier than ever to navigate the web.

## How it works
1. Configure your aliases in the FireAlias settings panel.
2. Use the browser's search bar and type `goto <alias>`.
3. Navigate instantly to the URL associated with the alias, or enhance it with powerful parameter-based customization!

## Features
### 🔗 Link Parameters
Enhance your aliases with dynamic URL replacements:
* {0}: The alias itself.
* {n}: The n-th word after the alias.
* {@}: All additional parameters after the alias.

#### {@} Example:
* **alias**: `search`
* **link**: `google.com/search?q={@}`
* **usage**: `goto search how many people are currently on the iss`
* **result**: `https://google.com/search?q=how+many+people+are+currently+on+the+iss`.

#### {n} Example:
* **alias**: `r`
* **link**: `reddit.com/r/{1}`
* **usage**: `goto r all`
* **result**: `https://reddit.com/r/all`.

### Conditional Parameters
Further enhance your aliases with conditional URL replacements. 
If we take a look at the reddit example, if we use the alias by itself (without parameters), it would navigate to `https://www.reddit.com/r/` which ends up in an error page.
This is not a great experience and it would be nice if we could avoid this.
That is what conditional parameters are designed to do.

We only want to add the /r/ to the url **if** we enter a parameter as well.
By using the conditional parameter syntax, we can change our configured link to do exactly this.

The format of conditional parameters is `{?x:y}` where `x` is the parameter (@ or a number) and `y` is the text we want to add if `x` exists. For example: `{?1:/r/}` will only add `/r/` if the parameter `{1}` exists and is not empty. 

If we configure an alias with the following setup:
* **alias**: `r`
* **link**: `reddit.com{?1:/r/}{1}`
`goto r` will go to `https://reddit.com` but `goto r all` will go to `https://reddit.com/r/all`

Parameters can also be nested recursively so the example above can also be written as:
* **alias**: `r`
* **link**: `reddit.com{?1:/r/{1}}`
And it will function in the same way.

For example this alias will only add the first parameter if 3 parameters are written:
`reddit.com{?3:{?2:{?1:/r/{1}}}}`

#### Firefox

[Firefox Add-ons][Mozilla]

#### Chromium

[Chrome Web Store][Chrome]

FireAlias should be compatible with any Chromium-based browser.

## Release History

[Releases Page][Releases]

## About

[GPLv3 License][License]

Free. Open-source. For users by users. No donations sought.

If you ever want to contribute something, think about the people working hard to maintain the filter lists you are using, which are available to use by all for free.


<!---------------------------------[ Internal ]-------------------------------->
[Manual Installation]: https://github.com/Brent-rb/fire-alias-v2/tree/master/dist#install
[Extended Syntax]: https://github.com/Brent-rb/fire-alias-v2/wiki/Static-filter-syntax#extended-syntax
[Privacy Policy]: https://github.com/Brent-rb/fire-alias-v2/wiki/Privacy-policy
[Permissions]: https://github.com/Brent-rb/fire-alias-v2/wiki/Permissions
[Commit Rate]: https://github.com/Brent-rb/fire-alias-v2/commits/master
[Works Best]: https://github.com/Brent-rb/fire-alias-v2/wiki/uBlock-Origin-works-best-on-Firefox
[Deployment]: https://github.com/Brent-rb/fire-alias-v2/wiki/Deploying-uBlock-Origin
[Blocking]: https://github.com/Brent-rb/fire-alias-v2/wiki/Blocking-mode
[Releases]: https://github.com/Brent-rb/fire-alias-v2/releases
[Issues]: https://github.com/Brent-rb/fire-alias-v2/issues
[Wiki]: https://github.com/Brent-rb/fire-alias-v2/wiki

<!----------------------------------[ Badges ]--------------------------------->
[Badge Commits]: https://img.shields.io/github/commit-activity/m/Brent-rb/fire-alias-v2?label=Commits
[Badge Mozilla]: https://img.shields.io/amo/rating/firealias?logo=firefox
[Badge License]: https://img.shields.io/badge/License-GPLv3-blue.svg
[Badge Chrome]: https://img.shields.io/chrome-web-store/rating/kkdiecfcjiijbplpjjjipgiebcimeokd?logo=googlechrome
[Badge Issues]: https://img.shields.io/github/issues/Brent-rb/fire-alias-v2