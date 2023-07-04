import requests
from utils.csv import import_csv

API_BASE_URL="http://localhost:3333"

def main():
    (_, data) = import_csv("../../data/parts_capacitors.csv", delimiter="\t")
    session = requests.Session()

    for obj in data:
        part = {
            "ipn": obj.get("Internal PN", ""),
            "mpn": obj.get("Part Number"),
            "manufacturer": obj.get("Manufacturer", ""),
            "description": obj.get("Description"),
            "value": obj.get("Value"),
            "package": obj.get("Package"),
        }
        r = session.post("/".join([API_BASE_URL, "parts"]), json={
            "part": part
        })
        if r.status_code != 200:
            print("ERR:", r.status_code, r.json()["message"], part)
 
    print("Done")

main()
