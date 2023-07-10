import json
import os
import sys
from datetime import datetime, timedelta
from textwrap import dedent


def logger(x): return print(x, flush=True)


data = json.loads(sys.stdin.read())

if not data['username']:
    logger("Please enter a valid username.")
    exit()
if not data['following_now']:
    logger("Please enter a following now.")
    exit()
if not data['following_now']:
    logger("Please enter a following now.")
    exit()


if type(data['following_now']) == str:
    data['following_now'] = int(data['following_now'])
if type(data['followers_now']) == str:
    data['followers_now'] = int(data['followers_now'])


try:
    import pandas as pd
except ImportError:
    logger(
        "If you want to use telegram_reports, please type in console: 'pip3 install gramaddict[telegram-reports]'"
    )

iBot_path = os.path.join(os.path.dirname(
    os.path.dirname(__file__)), 'Bot', 'accounts', data['username'])

sessionPath = os.path.join(os.path.dirname(
    os.path.dirname(__file__)), 'accounts', data['username'])


class GenerateReports():

    def run(self, username, followers_now, following_now):
        self.followers_now = followers_now
        self.following_now = following_now
        self.time_left = None
        self.username = username

        def telegram_bot_sendtext(text):
            return logger(text)

        if username is None:
            logger(
                "You have to specify an username for getting reports!")
            return None
        with open(os.path.join(sessionPath, 'sessions.json')) as json_data:
            activity = json.load(json_data)

        aggActivity = []
        for session in activity:
            try:
                id = session["id"]
                start = session["start_time"]
                finish = session["finish_time"]
                followed = session.get("total_followed", 0)
                unfollowed = session.get("total_unfollowed", 0)
                likes = session.get("total_likes", 0)
                watched = session.get("total_watched", 0)
                comments = session.get("total_comments", 0)
                pm_sent = session.get("total_pm", 0)
                followers = int(session.get("profile", 0).get("followers", 0))
                following = int(session.get("profile", 0).get("following", 0))
                aggActivity.append(
                    [
                        start,
                        finish,
                        likes,
                        watched,
                        followed,
                        unfollowed,
                        comments,
                        pm_sent,
                        followers,
                        following,
                    ]
                )
            except TypeError:
                logger(f"The session {id} has malformed data, skip.")
                continue

        df = pd.DataFrame(
            aggActivity,
            columns=[
                "start",
                "finish",
                "likes",
                "watched",
                "followed",
                "unfollowed",
                "comments",
                "pm_sent",
                "followers",
                "following",
            ],
        )
        df["date"] = df.loc[:, "start"].str[:10]
        df["duration"] = pd.to_datetime(df["finish"], errors="coerce") - pd.to_datetime(
            df["start"], errors="coerce"
        )
        df["duration"] = df["duration"].dt.total_seconds() / 60

        if self.time_left is not None:
            timeString = f'Next session will start at: {(datetime.now()+ timedelta(seconds=self.time_left)).strftime("%H:%M:%S (%Y/%m/%d)")}.'
        else:
            timeString = "There is no new session planned!"

        dailySummary = df.groupby(by="date").agg(
            {
                "likes": "sum",
                "watched": "sum",
                "followed": "sum",
                "unfollowed": "sum",
                "comments": "sum",
                "pm_sent": "sum",
                "followers": "max",
                "following": "max",
                "duration": "sum",
            }
        )
        if len(dailySummary.index) > 1:
            dailySummary["followers_gained"] = dailySummary["followers"].astype(
                int
            ) - dailySummary["followers"].astype(int).shift(1)
        else:
            logger(
                "First day of botting eh? Stats for the first day are meh because we don't have enough data to track how many followers you earned today from the bot activity."
            )
            dailySummary["followers_gained"] = dailySummary["followers"].astype(
                int)
        dailySummary.dropna(inplace=True)
        dailySummary["followers_gained"] = dailySummary["followers_gained"].astype(
            int)
        dailySummary["duration"] = dailySummary["duration"].astype(int)
        numFollowers = int(dailySummary["followers"].iloc[-1])
        n = 1
        milestone = ""
        try:
            for x in range(10):
                if numFollowers in range(x * 1000, n * 1000):
                    milestone = f"• {str(int(((n * 1000 - numFollowers)/dailySummary['followers_gained'].tail(7).mean())))} days until {n}k!"
                    break
                n += 1
        except OverflowError:
            logger("Not able to get milestone ETA..")

        def undentString(string):
            return dedent(string[1:])[:-1]

        followers_before = int(df["followers"].iloc[-1])
        following_before = int(df["following"].iloc[-1])
        statString = f"""
                *Stats for {username}*:

                *✨Overview after last activity*
                • {self.followers_now} followers ({self.followers_now - followers_before:+})
                • {self.following_now} following ({self.following_now - following_before:+})

                *🤖 Last session actions*
                • {str(df["duration"].iloc[-1].astype(int))} minutes of botting
                • {str(df["likes"].iloc[-1])} likes
                • {str(df["followed"].iloc[-1])} follows
                • {str(df["unfollowed"].iloc[-1])} unfollows
                • {str(df["watched"].iloc[-1])} stories watched
                • {str(df["comments"].iloc[-1])} comments done
                • {str(df["pm_sent"].iloc[-1])} PM sent

                *📅 Today's total actions*
                • {str(dailySummary["duration"].iloc[-1])} minutes of botting
                • {str(dailySummary["likes"].iloc[-1])} likes
                • {str(dailySummary["followed"].iloc[-1])} follows
                • {str(dailySummary["unfollowed"].iloc[-1])} unfollows
                • {str(dailySummary["watched"].iloc[-1])} stories watched
                • {str(dailySummary["comments"].iloc[-1])} comments done
                • {str(dailySummary["pm_sent"].iloc[-1])} PM sent

                *📈 Trends*
                • {str(dailySummary["followers_gained"].iloc[-1])} new followers today
                • {str(dailySummary["followers_gained"].tail(3).sum())} new followers past 3 days
                • {str(dailySummary["followers_gained"].tail(7).sum())} new followers past week
                {milestone if not "" else ""}

                *🗓 7-Day Average*
                • {str(round(dailySummary["followers_gained"].tail(7).mean(), 1))} followers / day
                • {str(int(dailySummary["likes"].tail(7).mean()))} likes
                • {str(int(dailySummary["followed"].tail(7).mean()))} follows
                • {str(int(dailySummary["unfollowed"].tail(7).mean()))} unfollows
                • {str(int(dailySummary["watched"].tail(7).mean()))} stories watched
                • {str(int(dailySummary["comments"].tail(7).mean()))} comments done
                • {str(int(dailySummary["pm_sent"].tail(7).mean()))} PM sent
                • {str(int(dailySummary["duration"].tail(7).mean()))} minutes of botting
            """
        try:
            r = telegram_bot_sendtext(
                f"{undentString(statString)}\n\n{timeString}")
        except Exception as e:
            logger(f"Failed to flush data from telegram config : {e}")


generatedReports = GenerateReports()
generatedReports.run(username=data["username"],
                     followers_now=data["followers_now"], following_now=data["following_now"])
