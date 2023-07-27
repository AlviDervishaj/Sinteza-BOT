export const formatDate = (date: number | Date) => {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
}
export const oneWeekAway = () => {
  const now = new Date();
  const inOneWeek = now.setDate(now.getDate() + 7);
  return new Date(inOneWeek);
}

// Delay api calls until x 
export const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
  let timerId: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => func(...args), delay);
  };
};


// limit the rate of api calls to once every x ms
export const throttle = <T extends unknown[]>(func: (...args: T) => void, limit: number) => {
  let inThrottle = false;

  return (...args: T) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const pidFormattingLinux = (data: string): string => {
    if(process.env.SYSTEM === 'linux') throw new Error("Change system env !!");
    const _split_data: string[] = data.split("\n");
    // filter out empty elements
    const _not_empty: string[] = _split_data.filter(element => element);
    // select the first one in the list
    const _process: string = _not_empty[0];
    const _formatted_process = _process.split(' ').filter(element => element).join(" ");
    const pid: string = _formatted_process.split(" ")[1];
    return pid;
}


export const intervals = [
  {
    id: '1m',
    name: 'Every Minute',
    cron: '* * * * *',
  },
  {
    id: '10m',
    name: 'Every 10 mins',
    cron: '*/10 * * * *',
  },
  {
    id: '1h',
    name: 'Every Hour',
    cron: '0 * * * *',
  },
  {
    id: '12h',
    name: 'Every 12 hours',
    cron: '0 */12 * * *',
  },
  {
    id: '1d',
    name: 'Every Day',
    cron: '0 0 * * *',
  },
  {
    id: '1w',
    name: 'Every Week',
    cron: '0 0 * * 0',
  },
  {
    id: '1mo',
    name: 'Every Month',
    cron: '0 0 1 * *',
  },
]

export const URLcondition =
  process.env.NODE_ENV === "development"
    ? "/api"
    : "https://sinteza.vercel.app";



    // GramAddict.core.device_facade.DeviceFacade.JsonRpcError: -32001 Jsonrpc error: <androidx.test.uiautomator.UiObjectNotFoundException> data: UiSelector[RESOURCE_ID_REGEX=android:id/switch_widget], method: objInfo