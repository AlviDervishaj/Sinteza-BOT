#!/bin/bash
bus_numbers=$(sudo lsusb | grep -E 'Samsung' | awk '/Bus/ {print $2,$4}')
echo $bus_numbers
