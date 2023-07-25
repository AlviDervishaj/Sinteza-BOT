#!/bin/bash
devices=$(sudo lsusb -s $1 -v | grep -E 'idVendor|idProduct|iSerial')
echo $devices