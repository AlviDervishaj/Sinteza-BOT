import usb.core

dev = usb.core.find(find_all=1)
for cfg in dev:
    print(cfg)
