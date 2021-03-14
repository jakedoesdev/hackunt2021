from bluepy.btle import Scanner, DefaultDelegate
import time, datetime, json, socket, requests

# create a delegate class to receive the BLE broadcast packets
class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

hostPi = socket.gethostname()
while True:
    print("Scanning...")
    scanner = Scanner().withDelegate(ScanDelegate())
    devices = scanner.scan(10.0)

    for dev in devices:
        t = time.localtime()
        now = time.strftime("%H:%M:%S", t)
        
        dev_obj = {
        "pi_name": hostPi,      #hostname
        "device_id": dev.addr,  #MAC dev.addr
        "RSSI": dev.rssi,       #dev.rssi
        "time": now             #current sys time
        }

        js_obj = json.dumps(dev_obj)
        print("Sending: ", js_obj)
        #r = requests.post("https://pitracker.helpfulseb.com/api/track", data=js_obj)

    print("Waiting...")
    time.sleep(5)
