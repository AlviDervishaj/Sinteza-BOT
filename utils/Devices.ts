export const DevicesList = {
  "R9ZW305K08Z": "A01",
  "R7AT310QB5L": "A02",
  "R7ST405PFVZ": "A03",
  "R7AT310PKFE": "A04",
  "R7AT310N6YN": "A05",
  "R7AT310PDHN": "A06",
  "R7ST405MD7M": "A07",
  "R7AT310PE5A": "A08",
  "R7ST31LDCJH": "B09",
  "R7AT310PDQK": "A10",
  "R7AT310MW0F": "A11",
  "R7AT310Q61D": "A12",
  "R7ST30V0XHR": "A13",
  "R7ST31LD00J": "B14",
  "R7AT310HMKH": "A15",
  "R7ST405K51K": "A16",
  "R7AT310P7CM": "A17",
  "R9YT805BYNL": "A18",
  "R7AT310P7AV": "A19",
  "R7ST405MTZP": "A20",
  "R7SRC1WTKFA": "B21",
  "R7ST30V31RK": "A22",
  "R7AT310HPTF": "A23",
  "R7ST405PJGR": "A24",
  "R7ST30TVVJE": "C25",
  "R7AT310NYTR": "A30",
  "R7ST30TZZ0J": "A31",
  "R7AT310PLGR": "A32",
  "R7AT310Q98N": "A33",
  "R7ST12LK1QJ": "B34",
  "R7AT310MPTY": "A35",
  "R7AT310Q6PY": "A36",
  "R7ST30TZN5V": "A37",
  "R7AT310PHJB": "A38",
  "R7AT310NHRE": "A39",
  "R7ST30V5MHT": "A40",
  "R7ST405M05E": "A41",
  "R7AT310P8AB": "A42",
  "R7AT310QMVP": "A43",
  "R7ST405K7PP": "A44",
  "R7AT41BHF2H": "A45",
  "R7ST30TYCHE": "A46",
  "R7AT310J26E": "A47",
  "R7AT310FTBJ": "A48",
  "R7STB0PS5AA": "A49",
  "R7AT310NZMK": "A50",
  "R7ST12LG1QF": "A51",
  "R7ST31L8DWN": "A52",
  "R7AT30TZY2R": "A53",
  "ca2937e9": "A54",
}

export class Device {
  private _id: string;
  private _name: string;
  private _battery: string;
  private _process: { username: string, configFile: string } | null;

  constructor(id: string, name: string, battery: string, process: { username: string, configFile: string } | null) {
    this._id = id;
    this._name = name;
    this._battery = battery;
    this._process = process;
  }

  get id(): string {
    return this._id;
  }
  get battery(): string {
    return this._battery;
  }

  get process(): { username: string, configFile: string } | null {
    return this._process;
  }
  get name(): string {
    return this._name;
  }
}
