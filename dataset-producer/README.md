<h1><img src="https://sharedmobility.ai/wp-content/uploads/2019/02/logosharedmobility-02-1.svg" alt="SharedMobility.ai" width="350"></h1>

## DataSet Producer

The dataset producer exports the <abbr title="SharedMobility.ai">SMAI</abbr> database
into separate CSV files. These files can be used directly as input datasets by TensorFlow / Keras:

#### JavaScript / TensorFlow.js
```javascript
const DATA_URL = "https://storage.googleapis.com/smai-public-datasets/citybikewien/fullrange/service_2-2019-05-07_2019-07-31.csv";
const csvDataset = await tf.data.csv(DATA_URL);
```

#### Python
````python
TRAIN_DATA_URL = "https://storage.googleapis.com/smai-public-datasets/citybikewien/fullrange/service_2-2019-05-07_2019-07-31.csv"
train_file_path = tf.keras.utils.get_file("train.csv", TRAIN_DATA_URL)
````

### Get the Data

You find a set of already exported data set in our public Google Cloud Storage bucket:

[https://storage.googleapis.com/smai-public-datasets/][BUCKET]

* [Full export CSV][FULL] for Citybike Wien from 2019-05-07 to 2019-07-31
* [Only station CSV][ONESTATION] for Citybike Wien's station at Kärtner Ring / Vienna Opera from 2019-05-07 to 2019-07-31

### Known Issues

* The `<start-date>` and `<end-date>` are not in UTC, but in the time zone defined by the config's `timeZone` property.
  This is because all current SMAI stations are located in `Europe/Vienna`. If you want to use the producer outside the
  central European time zone, you should change this to `UTC` or your local time zone.
* You cannot configure the CSV format. We use standard CSV with `,` as a delimiter and `\r\n` as line separator.

## Licenses

* Citybike Wien station data provided by [citybik.es][Citybikes] without any restriction
* Weather data provided by [ZAMG][ZAMG] licensed under [CC BY 3.0 AT][CCBYAT]
* Weather API and export by [AT-Wetter.tk](http://at-wetter.tk/)

[BUCKET]: https://storage.googleapis.com/smai-public-datasets/
[FULL]: https://storage.googleapis.com/smai-public-datasets/citybikewien/fullrange/service_2-2019-05-07_2019-07-31.csv
[ONESTATION]: https://storage.googleapis.com/smai-public-datasets/citybikewien/fullrange/service_2-station_17_citybikewien-karntner-ring-1028-2019-05-07_2019-07-31.csv
[Citybikes]: https://www.citybik.es/
[ZAMG]: https://www.data.gv.at/katalog/dataset/9b40a0af-a6fe-47ff-9624-2ea8f40c746f
[CCBYAT]: https://creativecommons.org/licenses/by/3.0/at/deed.de
