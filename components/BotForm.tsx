import { FC, useState, useEffect } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { Process } from "../utils/Process";
import { BotFormData } from "../utils/Types";
import { start_bot, start_bot_checks } from "../utils/api-client";

type Props = {
  setError: (error: string) => void;
  setData: (data: string) => void;
  logData: (data: string) => void;
  getDevices: () => void;
  displayError: (error: string) => void;
  handleScroll: () => void;
  setDevices: Dispatch<SetStateAction<string[]>>;
  devices: string[];
  processes: Process[];
  addToPool: (process: Process) => void;
  killBot: (event: any, process: Process) => void;
  updateProcessResult: (process: Process, result: string) => void;
};

export const BotForm: FC<Props> = ({
  setError,
  getDevices,
  devices,
  setDevices,
  logData,
  handleScroll,
  processes,
  killBot,
  addToPool,
  updateProcessResult,
}) => {
  const [alreadyCalled, setAlreadyCalled] = useState<boolean>(false);
  const [membership, setMembership] = useState<"PREMIUM" | "FREE">("FREE");
  const [formData, setFormData] = useState<BotFormData>({
    username: "",
    device: "",
    password: "",
    "speed-multiplier": 1,
    "truncate-sources": "",
    "blogger-followers": [],
    "hashtag-likers-top": [],
    "unfollow-non-followers": "",
    "unfollow-skip-limit": "",
    "working-hours": [],
  });
  useEffect(() => {
    getDevices();
    return () => {
      setDevices([]);
    };
  }, []);
  const checkFormData = () => {
    if (!formData.username || formData.username.trim() === "") {
      return setError("Please enter a username.");
    }
    if (!formData.device || formData.device.trim() === "") {
      return setError("Please select a device.");
    }
    if (!formData.password || formData.password.trim() === "") {
      return setError("Please enter a password.");
    }
    if (!formData["speed-multiplier"] || formData["speed-multiplier"] === 0) {
      return setError("Please enter a Speed Multiplier.");
    }
    if (
      !formData["truncate-sources"] ||
      formData["truncate-sources"].trim() === ""
    ) {
      return setError("Please enter truncate sources.");
    }
    if (
      !formData["blogger-followers"] ||
      formData["blogger-followers"].length === 0
    ) {
      logData("[INFO] Blogger Followers: DEFAULT");
    }
    if (
      !formData["hashtag-likers-top"] ||
      formData["hashtag-likers-top"].length === 0
    ) {
      logData("[INFO] Hashta Likes Top: DEFAULT");
    }
    if (
      !formData["unfollow-non-followers"] ||
      formData["unfollow-non-followers"].trim() === ""
    ) {
      logData("[INFO] Unfollow Non Followers: DEFAULT");
    }
    if (
      !formData["unfollow-skip-limit"] ||
      formData["unfollow-skip-limit"].trim() === ""
    ) {
      logData("[INFO] Unfollow Skip Limit: DEFAULT");
    }
    if (!formData["working-hours"] || formData["working-hours"].length === 0) {
      logData("[INFO] Working Hours: DEFAULT");
    }
    return true;
  };
  const startBotChecks = async () => {
    // check if another process is running
    handleScroll();
    start_bot_checks(formData, (output: string) => {
      logData(output);
    });
    // start process
    setAlreadyCalled(false);
    // const data = await result.text();
    // logData(data);
  };
  const callApi = async (event: MouseEvent) => {
    event.preventDefault();
    if (alreadyCalled) return;
    if (checkFormData() !== true) return;
    setAlreadyCalled(true);
    logData("[INFO] Starting bot checks... ");
    await startBotChecks();
    logData("[INFO] Starting bot...");
    const p = new Process(
      formData.device,
      formData.username,
      membership,
      "RUNNING",
      "",
      []
    );
    start_bot(formData, (output: string) => {
      updateProcessResult(p, output);
      addToPool(p);
    });
    setAlreadyCalled(false);
    handleScroll();
  };
  return (
    <>
      <h2 className="text-center text-4xl tracking-wide py-4">Add a Bot</h2>
      <section className="w-full lg:w-1/2 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 place-items-center">
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="username" className="text-base">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={formData.username}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                username: event.target.value,
              }))
            }
            placeholder="Enter username"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Instagram username of the user that the bot will run for
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="devices" className="text-base">
            Devices *
          </label>
          <select
            id="devices"
            name="devices"
            required
            value={formData.device}
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                device: event.target.value,
              }))
            }
          >
            <option value="">Select Device</option>
            {devices &&
              devices.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
          </select>
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Refresh the devices by clicking the button below.
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fif">
          <label htmlFor="membership" className="text-base">
            Membership
          </label>
          <select
            id="membership"
            name="membership"
            required
            value={membership}
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setMembership(event.target.value as "PREMIUM" | "FREE")
            }
          >
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="password" className="text-base">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                password: event.target.value,
              }))
            }
            placeholder="Enter password"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Instagram password of the user
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="speed-multiplier" className="text-base">
            Speed *
          </label>
          <input
            type="number"
            id="speed-multiplier"
            name="speed-multiplier"
            required
            value={formData["speed-multiplier"]}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                "speed-multiplier": event.target.value as any,
              }))
            }
            placeholder="Enter Speed"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Format: Just a number
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="truncateSources" className="text-base">
            Truncate Sources *
          </label>

          <input
            type="text"
            id="truncateSources"
            name="truncateSources"
            required
            value={formData["truncate-sources"]}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                "truncate-sources": event.target.value,
              }))
            }
            placeholder="Truncate Process"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Format: Start-End
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="bloggerFollowers" className="text-base">
            Blogger Followers
          </label>

          <input
            type="text"
            id="bloggerFollowers"
            name="bloggerFollowers"
            value={formData["blogger-followers"]}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                ["blogger-followers"]: event.target.value.toString().split(" "),
              }))
            }
            placeholder="Blogger followers"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Format: Username1 Username2 Username3
          </small>
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            To make it easier, the programm inserts a comma after each space
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="hashtagLikesTop" className="text-base">
            Hashtag Likers Top
          </label>

          <input
            type="text"
            id="hashtagLikesTop"
            name="hashtagLikesTop"
            value={formData["hashtag-likers-top"]}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                ["hashtag-likers-top"]: event.target.value.trim().split(" "),
              }))
            }
            placeholder="Hashtag likes top"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Format: hashtag1 hashtag2 hashtag3
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="unfollowNonFollowers" className="text-base">
            Unfollow Non Followers
          </label>

          <input
            type="text"
            id="unfollowNonFollowers"
            name="unfollowNonFollowers"
            value={formData["unfollow-non-followers"]}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                ["unfollow-non-followers"]: event.target.value,
              }))
            }
            placeholder="Unfollow non followers"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Format: Min-Max
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="unfollowSkipLimit" className="text-base">
            Unfollow Skip Limit
          </label>

          <input
            type="text"
            id="unfollowSkipLimit"
            name="unfollowSkipLimit"
            value={formData["unfollow-skip-limit"]}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                ["unfollow-skip-limit"]: event.target.value,
              }))
            }
            placeholder="Unfollow skip limit"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Format: any
          </small>
        </div>
        <div className="flex flex-col gap-1 w-9/12 lg:w-full h-fit">
          <label htmlFor="workingHours" className="text-base">
            Working Hours
          </label>

          <input
            type="text"
            id="workingHours"
            name="workingHours"
            value={formData["working-hours"]}
            autoComplete="no"
            className="bg-transparent max-w-md border-b-2 border-gray-700 px-2 py-1 outline-none hover:bg-slate-200"
            onChange={(event) =>
              setFormData((previousData: BotFormData) => ({
                ...previousData,
                ["working-hours"]: event.target.value.toString().split(" "),
              }))
            }
            placeholder="Working hours"
          />
          <small className="tracking-wider text-slate-600 text-sm lg:text-base">
            Format: HH.MM-HH.MM HH.MM-HH.MM
          </small>
        </div>
      </section>
      <div className="space-x-6 pb-20 pt-12">
        <button
          disabled={alreadyCalled}
          onClick={(event) => callApi(event)}
          type="button"
          className="w-fit h-fit py-1 px-2 lg:px-4 lg:py-2 disabled:border-red-600 disabled:hover:bg-transparent border border-solid border-green-600 bg-green-400 rounded-lg hover:bg-transparent text-base lg:text-xl"
        >
          Start Bot
        </button>
        <button
          onClick={() => getDevices()}
          type="button"
          className="w-fit h-fit py-1 px-2 lg:px-4 lg:py-2 disabled:border-red-600 disabled:hover:bg-transparent border border-solid border-slate-400 rounded-lg hover:bg-slate-500 hover:text-slate-100 text-base lg:text-xl"
        >
          Refresh Devices
        </button>
        <button
          onClick={(event) =>
            killBot(
              event,
              processes.filter(
                (p) =>
                  p.device === formData.device &&
                  p.username === formData.username
              )[0]
            )
          }
          type="button"
          className="w-fit h-fit py-1 px-2 lg:px-4 lg:py-2 disabled:border-red-600 disabled:hover:bg-transparent border border-solid border-red-400 rounded-lg hover:bg-red-500 hover:text-slate-100 text-base lg:text-xl"
        >
          Kill Bot
        </button>
      </div>
    </>
  );
};
