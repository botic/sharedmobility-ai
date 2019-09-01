

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: ww
"""

from keras.models import Sequential
from keras.layers import Dense
from keras.layers import Flatten
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np 
from sklearn.cross_validation import train_test_split
from sklearn.preprocessing import MinMaxScaler, StandardScaler

data = pd.read_csv('data/citybikewien_2019-06--2019-07.csv')
data.index = pd.to_datetime(data.snp_timestamp)
data = data.fillna(method='ffill')

# drops the timestamp, not needed
data.drop(['snp_timestamp'], axis=1, inplace=True)

stations = {k: v for k, v in data.groupby('snp_sta_id')}

# array to collect all results
results = []

for station, status in stations.items(): 
    # only use a 15 min mean aggregation
    status = round(status.resample('15Min').mean())
    status = status.fillna(method='ffill')
    
    scaler = StandardScaler()
    
    # defines the target variable
    Y = status.iloc[:,1].loc['2019-06-01 00:00:00':'2019-06-30 23:45:00']
    
    #
    # create feature vector
    #
    
    # prepare weather data to merge
    Weather = pd.read_csv('data/weatherset.csv', index_col=0)
    Weather.index = pd.to_datetime(Weather.index)
    
    # the input feature vector
    XX = pd.concat([Weather, status['snp_boxes_available']], axis=1)
    XX['Date'] = XX.index        
    XX['Date'] = XX.index
    XX['weekday'] = XX['Date'].dt.dayofweek
    XX["Day"] = XX['Date'].map(lambda x: x.day)
    XX["Month"] = XX['Date'].map(lambda x: x.month)
    XX["Hour"] = XX['Date'].map(lambda x: x.hour)
    XX["Minute"] = XX['Date'].map(lambda x: x.minute)

    # create cyclical features to avoid big jumps in the input variable for hour
    # e.g. 23:59 to 00:00 <==> 0.9999f and 0.0f is a huge cliff, so use sin/cos instead 
    XX['Hourfloat'] = XX.Hour + XX.Minute / 60.0
    XX['Sin'] = np.sin(2. * np.pi * XX.Hourfloat / 24.)
    XX['Cos'] = np.cos(2. * np.pi * XX.Hourfloat / 24.)

    # drops unnecessary input values, they might be harmful to the final result
    XX = XX.drop([
            'Date', #'weekday', 'Day', 'Month', 
            'Hour', 'Minute', 
            'Hourfloat', 
            'Sun', #'Temp',
            #'Sin',
            #'Cos'
        ], axis=1)

    # defines the training timeframe / sample
    X = XX.loc['2019-06-01 00:00:00':'2019-06-30 23:45:00']
    
    # we split into a training and testing set
    X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size = 0.25) # best with 25% 
    
    #X_train = X_train.values #.reshape(-1, 1)
    #X_test = X_test.values #.reshape(-1, 1)
    
    # alternative to the reshaping from above
    scaler.fit(X_train)
    X_train = scaler.transform(X_train)
    X_test = scaler.transform(X_test)
    
    input_shape = X_train.shape

    #
    # create the network model
    #
    model = Sequential()
    model.add(Dense(9, activation='relu', input_dim=8))
                   
    model.add(Dense(12, activation='relu'))
    #model.add(Flatten())
    model.add(Dense(1, activation='linear'))

    model.compile(loss='mean_squared_error',
              optimizer='adam',
              metrics=['accuracy'])
    
    # x_train and y_train are Numpy arrays --just like in the Scikit-Learn API.
    model.fit(X_train, y_train, epochs=64, batch_size=2880)
    
    score = model.evaluate(X_test, y_test, batch_size=2880)
    
    # make predictions for a given day
    DF = status.iloc[:,1].loc['2019-07-01 00:00:00':'2019-07-01 23:45:00']
    
    DF_weather = XX.loc['2019-07-01 00:00:00':'2019-07-01 23:45:00']
    #DF_weather = pd.concat([Weather, status['snp_boxes_available']], axis=1).loc['2019-07-01 00:00:00':'2019-07-01 23:45:00']
    #DF_weather = status['snp_boxes_available'].loc['2019-07-01 00:00:00':'2019-07-01 23:45:00']
    
    
    Y1 = DF.values
    X1 = DF_weather.values
    #X1 = scaler.transform(X1)
    
    day = np.array(DF.index)
    
    forecast = model.predict(X1, batch_size=96)
    forecast = np.around(forecast)
    #scaler.inverse_transform(forecast)
    results.append(forecast)
    
    # plot out a sample day
    plt.plot(day, forecast, label="forecast")
    plt.plot(day, DF, label='real demand')
    plt.plot(day, DF_weather)
    plt.ylim(ymin=0)
    plt.xticks( rotation=25 )
    plt.legend(loc="upper right")
    plt.show()
