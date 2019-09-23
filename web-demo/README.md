<h1><img src="https://sharedmobility.ai/wp-content/uploads/2019/02/logosharedmobility-02-1.svg" alt="SharedMobility.ai" width="350"></h1>

## Web App Demo

This is the proof of concept Web application for the Netidee project.
It shows how predictions could be displayed to users and is an nice
debugging tool for the TensorFlow models.

The Web app uses the Web API, which is available at [api.sharedmobility.ai](https://api.sharedmobility.ai/v1) 
and open with `Access-Control-Allow-Origin: *` for CORS requests.
It also loads [the current station](STATION_LIST) list directly from the GCS bucket.

**Public demo: [app.sharedmobility.ai](https://app.sharedmobility.ai/)**

### Project setup

The Web app uses [Vue CLI 3](VUE_CLI) to generate a standard app layout.

#### Install dependencies

You can install all dependencies with:

```
npm install
```

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Run your tests
```
npm run test
```

#### Lints and fixes files
```
npm run lint
```

#### Customize configuration
See Vue CLI's [Configuration Reference](https://cli.vuejs.org/config/) for more details.


## Licenses

* Citybike Wien station data provided by [citybik.es][CITYBIKES] without any restriction
* Weather data provided by [ZAMG][ZAMG] licensed under [CC BY 3.0 AT][CCBYAT]

[BUCKET]: https://storage.googleapis.com/smai-public-datasets/
[CITYBIKES]: https://www.citybik.es/
[ZAMG]: https://www.data.gv.at/katalog/dataset/9b40a0af-a6fe-47ff-9624-2ea8f40c746f
[CCBYAT]: https://creativecommons.org/licenses/by/3.0/at/deed.de
[STATION_LIST]: https://storage.googleapis.com/smai-public-datasets/_metadata/smai_station_export.json
[VUE_CLI]: https://cli.vuejs.org/guide/
