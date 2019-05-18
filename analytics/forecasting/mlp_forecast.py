#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: ww
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np 
import pprint
from sklearn.neural_network import MLPRegressor
from sklearn.cross_validation import train_test_split
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Read a sample week from the available input data
data = pd.read_csv('kalenderwoche-2018-30.csv')
data.index = pd.to_datetime(data.snp_timestamp).fillna(method='ffill')
data.drop(['snp_timestamp'], axis=1, inplace=True)

# Group input data by station slug, which acts as an unique identifier
stations = {k: v for k, v in data.groupby('sta_slug')}

results = []
real_values = []

for station, status in stations.items():
    #
    # Step 1: Create a model for the given station
    #

    # Resample into time blocks of an hour
    status = round(status.resample('1H').mean())
    status.drop(['sta_internal_identifier'], axis=1, inplace=True)
    
    # Normalizes the data between -1 and +1
    scaler = StandardScaler()
    
    # X => input data, Y => data to be forecasted in the following steps
    # status.iloc takes the variables from the current status data frame
    X = status.iloc[:,4:7].loc['2018-07-23 00:00:00':'2018-07-27 23:59:00']
    Y = status.iloc[:,3].loc['2018-07-23 00:00:00':'2018-07-27 23:59:00']
    
    # Splits the whole week into a training set and test set;
    # For the first iteration of the forecast we ignore the different week days and use them equally.
    # Further forecasts might incorporate different weights for different weekdays, e.g. including holidays.
    X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size = 0.25) # best with 25% 
    
    # Normalize the training data
    scaler.fit(X_train) 
    
    X_train = scaler.transform(X_train)
    X_test = scaler.transform(X_test)
    
    # Multi-Layer Perceptron Regressor model;
    # This step requires the previous normalization steps.
    # We use two hidden layers with 12 nodes in the first and 24 node in the second layer.
    mlp = MLPRegressor(hidden_layer_sizes=(12,24), activation='logistic', learning_rate='adaptive', max_iter=5000) 
    
    # Fit the model with the data; we use 
    mlp.fit(X_train,y_train)
    
    # Debug: How many iterations have been executed to fit the model to the training data?
    print(mlp.n_iter_, 'iterations', station)
        
    # Make predictions for the test data set
    predictions = mlp.predict(X_test)
    
    # Measure error of the forecasts against the test set
    SMAPE = np.mean(200*np.abs((predictions - y_test) / (y_test + predictions) ))
    MAE = mean_absolute_error(y_test, predictions)
    print(SMAPE, MAE)
    
    #
    # Step 2: Forecasting
    #
    
    # Make predictions for given day
    DF = status.iloc[:,4:7].loc['2018-07-28 00:00:00':'2018-07-29 00:00:00']
    DF_PV = status.iloc[:,3].loc['2018-07-28 00:00:00':'2018-07-29 00:00:00']
    
    Y1 = DF_PV.values
    X1 = DF.values
    X1 = scaler.transform(X1)

    # Create a forecast for the given day
    forecast = mlp.predict(X1)

    day = np.array(DF_PV.index)
    SF = (sum(forecast)).astype(float)

    plt.plot(day, forecast, label="forecast")
    plt.ylim(ymin=0)
    plt.xticks( rotation=25 )
    plt.legend(loc="upper right")
    plt.show()

    results.append(forecast)
    real_values.append(Y1)

    # Lets you control the forecasted amount against the available real world data
    forecasted_amount = (sum(sum(results)))
    print("Forecasted amount:", forecasted_amount, "bikes available")

    # Plot the forecast
    # plt.plot(day, (sum(results)), label='forecast')
    # plt.ylim(ymin=0)
    # plt.xticks(rotation=25)
    # plt.legend(loc='upper right')
