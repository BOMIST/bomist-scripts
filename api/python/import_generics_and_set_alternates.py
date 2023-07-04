import argparse
import requests
from urllib.parse import urljoin
from utils.csv import import_csv


###
# Imports generic parts and set its alternates
# 
# Alternate parts must exist in the database already (previously imported or added).
# Alternate parts are identified through its Internal PN.
# Please check the provided "generics_and_alternates.csv" file  for reference.
# Another file can be passed through the --csv argument-
###

API_BASE_URL="http://localhost:3333"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", help="path to csv file to be parsed", default="../../data/generics_and_alternates.csv")
    args = parser.parse_args()


    (_, data) = import_csv(args.csv, delimiter="\t")
    session = requests.Session()

    # Get all alternate Internal PNs 
    alternates_ipns = []
    for obj in data:
        ipns = obj.get("Alternates", "").split(",")
        if len(ipns) > 0:
            alternates_ipns += ipns
    # ;ake sure there's no duplicates
    alternates_ipns = list(set(alternates_ipns))

    # Fetch all parts for given Internal PNs
    r = session.post(urljoin(API_BASE_URL, "/search"), json={
        "selector": {
            "type": "part",
            "part.ipn": {
                "$in": alternates_ipns
            }
        }
    })
    alternate_parts = r.json()

    # Create a dict so parts can be accessed by Internal PN
    # on memory (more efficient)
    alternate_parts_by_ipn = {}
    for alternate_part in alternate_parts:
        generic_part = alternate_part["part"]
        alternate_parts_by_ipn[generic_part.get("ipn")] = generic_part

    # Import generic parts and set their own alternates
    for obj in data:
        alternate_ipns = obj.get("Alternates", "").split(",")
        alt_parts_ids = []
        for alternate_ipn in alternate_ipns:
            alt_part = alternate_parts_by_ipn.get(alternate_ipn)
            alt_parts_ids.append(alt_part["id"])
        
        generic_part = {
            "type": "generic",
            "ipn": obj.get("Internal PN", ""),
            "mpn": obj.get("Part Number"),
            "manufacturer": obj.get("Manufacturer"),
            "description": obj.get("Description"),
            "value": obj.get("Value"),
            "package": obj.get("Package"),
            "alternates": alt_parts_ids
        }

        # Check if generic part already exists
        r = session.post(urljoin(API_BASE_URL, "/search"), json={
            "selector": {
                "type": "part",
                "part.type": "generic",
                "part.ipn": generic_part["ipn"]
            }
        })
        
        existing_part = None
        if r.status_code == 200 and len(r.json()) > 0:
            existing_part = r.json()[0]
        
        if existing_part:
            # Generic part already exists, update its alternates only
            r = session.put("/".join([API_BASE_URL, "parts", existing_part["id"]]), json={
                "part": {
                    "alternates": alt_parts_ids
                }
            })
        else:
            # Create generic part
            r = session.post(urljoin(API_BASE_URL, "/parts"), json={
                "part": generic_part
            })

        if r.status_code != 200:
            print("ERR:", r.status_code, r.json()["message"])

        
    print("Done")

main()
