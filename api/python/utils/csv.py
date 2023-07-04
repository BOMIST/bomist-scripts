import csv

def import_csv(filename, delimiter="\t", encoding="utf-8"):
    fields = []
    rows = []
    with open(filename, "r", encoding) as csvfile:
        csvreader = csv.reader(csvfile, delimiter)
        fields  = next(csvreader)
        for row in csvreader:
            rows.append(row)
        print("Total no. of rows: %d" % (csvreader.line_num))

    print("Field names are:\n" + "\n".join(field for field in fields))
