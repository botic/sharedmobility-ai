#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: ww
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as dates

# Read the input csv
data = pd.read_csv('kalenderwoche-2018-30.csv')
data.index = pd.to_datetime(data.snp_timestamp).fillna(method='ffill')
data.drop(['snp_timestamp'], axis=1, inplace=True)

# Groups all input data by the station slug
stations = {k: v for k, v in data.groupby('sta_slug')}

# Only keep the keys to iterate over
stations_list = list(stations.keys())

for station, status in stations.items():

    # Resample data in hourly intervals
    station_hourly = round(status.resample('1H').mean())
    
    # Group by minute 
    station_weekly_groups = station_hourly.groupby(station_hourly.index.map(lambda t: 60 * t.hour + t.minute))
    
    # Take the mean 
    station_weekly_averages = station_weekly_groups.mean()
    
    # Return readable time and splits into a time series
    def minute_into_hour(x):
        if x % 60 in range(0,10):
            return str(x // 60) + ":0" + str(x % 60)
        else:
            return str(x // 60) + ":" + str(x % 60)
        
    times = station_weekly_averages.index.map(minute_into_hour)
    
    # Add new timestamps to dataframe
    station_weekly_averages["timestamp"] = times
    
    # Plot the time against the number of bikes available
    fig = plt.figure(figsize=(10,5),dpi=100)

    ax = plt.subplot()
    t = pd.to_datetime(station_weekly_averages['timestamp'])
    bikes = station_weekly_averages['snp_vehicles_available']
    boxes = station_weekly_averages['snp_boxes_available']

    # Add labels to the plot
    ax.plot(t, bikes, label='bikes available')
    ax.plot(t, boxes, label='boxes available')
    
    ax.xaxis.set_major_formatter(dates.DateFormatter('%H:%M'))
    plt.setp(plt.xticks()[1], rotation=30)
    
    # Get the title of the station and assign to the plot
    station_name = str(station)
    ax.set_title(station_name)
    plt.xlabel('Time of Day')
    plt.ylabel('Average Bikes & Boxes Available')
    plt.legend(loc='upper left') 
    plt.savefig(station_name)
