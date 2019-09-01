<h1><img src="https://sharedmobility.ai/wp-content/uploads/2019/02/logosharedmobility-02-1.svg" alt="SharedMobility.ai" width="350"></h1>

## Web API

This express application is the <abbr title="SharedMobility.ai">SMAI</abbr> Web API.

### Configuration

The Web API relies by default on the following public Google Cloud Storage bucket:

[https://storage.googleapis.com/smai-public-datasets/][BUCKET]

If any new services or stations are added, you have to ensure that the `config.json` is updated as well.
To access the Cloud Storage service, ensure that you have set up a GCP service account with the
environment variable `GOOGLE_APPLICATION_CREDENTIALS`.


### Known Issues

* No flexible configuration, you must configure the API in the `config.json`.

## Licenses

* Citybike Wien station data provided by [citybik.es][CITYBIKES] without any restriction
* Weather data provided by [ZAMG][ZAMG] licensed under [CC BY 3.0 AT][CCBYAT]

[BUCKET]: https://storage.googleapis.com/smai-public-datasets/
[CITYBIKES]: https://www.citybik.es/
[ZAMG]: https://www.data.gv.at/katalog/dataset/9b40a0af-a6fe-47ff-9624-2ea8f40c746f
[CCBYAT]: https://creativecommons.org/licenses/by/3.0/at/deed.de
