#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: ww
"""

import pandas as pd 
import numpy as np

data = pd.read_csv('data/summer-2018.csv')
data.index = pd.to_datetime(data.snp_timestamp)
data = data.fillna(method='ffill')
data.drop(['snp_timestamp'], axis=1, inplace=True)

rain = pd.read_csv('data/Wetter/11035-regen.txt', sep = ';', header = None)
sun = pd.read_csv('data/Wetter/11035-sonne.txt', sep = ';', header = None)
temp = pd.read_csv('data/Wetter/11035-t.txt', sep = ';', header = None)

weather = pd.concat([rain[5], sun[5], temp[5]], axis=1)
weather.columns = ['Rain', 'Sun', 'Temp']
weather.index = pd.to_datetime(sun[7])
weather['Rain'] = weather['Rain'].astype(float)

# create a timestamp 
index = pd.date_range(data.index[0],data.index.max(), freq='15min')

values = [ x for x in range(len(index)) ]
Timestamp = pd.DataFrame(values,index=index)
Timestamp = Timestamp.astype(float)

# fill missing values 
Dataframe = data.combine_first(Timestamp).fillna(method='ffill')
Dataframe = Dataframe.drop(Dataframe.columns[-1], 1) # delete last column with integer values from Timestamp DF

DataframeW = weather.resample('15min').ffill()
#DataframeW.index = pd.to_datetime(DataframeW.index)
export_csv = DataframeW.to_csv (r'/SharedMobility.ai/data/weatherset.csv', index = True, header=True)
