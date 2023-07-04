def field_name_to_accessor(name):
    match name:
        case "Internal PN":
            return "ipn"
        case "Part Number":
            return "mpn"
        case _:
            return name.lower()
            