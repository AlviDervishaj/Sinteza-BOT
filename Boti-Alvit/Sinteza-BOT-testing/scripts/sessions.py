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
    data['following_now'] = 0
    exit()
if not data['following_now']:
    data['following_now'] = 0
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
                    milestone = f"{str(int(((n * 1000 - numFollowers)/dailySummary['followers_gained'].tail(7).mean())))} days until {n}k"
                    break
                n += 1
        except OverflowError:
            logger("Not able to get milestone ETA..")

        # def undentString(string):
        #     return dedent(string[1:])[:-1]

        followers_before = int(df["followers"].iloc[-1])
        following_before = int(df["following"].iloc[-1])
        statString = {
            "overview-followers": f"{self.followers_now} ({self.followers_now - followers_before:+})",
            "overview-following": f"{self.following_now} ({self.following_now - following_before:+})",
            "last-session-activity-bottling": f"{str(df['duration'].iloc[-1].astype(int))}",
            "last-session-activity-likes": f"{str(df['likes'].iloc[-1])}",
            "last-session-activity-follows": f"{str(df['followed'].iloc[-1])}",
            "last-session-activity-unfollows": f"{str(df['unfollowed'].iloc[-1])} ",
            "last-session-activity-stories-watched": f"{str(df['watched'].iloc[-1])}",
            "last-session-activity-comments-done": f"{str(df['comments'].iloc[-1])}",
            "last-session-activity-pm-sent": f"{str(df['pm_sent'].iloc[-1])}",
            "today-session-activity-bottling": f"{str(dailySummary['duration'].iloc[-1])}",
            "today-session-activity-likes": f"{str(dailySummary['likes'].iloc[-1])}",
            "today-session-activity-follows": f"{str(dailySummary['followed'].iloc[-1])}",
            "today-session-activity-unfollows": f"{str(dailySummary['unfollowed'].iloc[-1])}",
            "today-session-activity-stories-watched": f"{str(dailySummary['watched'].iloc[-1])}",
            "today-session-activity-comments-done": f"{str(dailySummary['comments'].iloc[-1])}",
            "today-session-activity-pm-sent": f"{str(dailySummary['pm_sent'].iloc[-1])}",
            "trends-new-followers-today": f"{str(dailySummary['followers_gained'].iloc[-1])}",
            "trends-new-followers-past-3-days": f"{str(dailySummary['followers_gained'].tail(3).sum())}",
            "trends-new-followers-past-week": f"{str(dailySummary['followers_gained'].tail(7).sum())}",
            "trends-milestone": f"{milestone if not '' else ''}",
            "weekly-average-followers-per-day": f"{str(round(dailySummary['followers_gained'].tail(7).mean(), 1))}",
            "weekly-average-likes": f"{str(int(dailySummary['likes'].tail(7).mean()))}",
            "weekly-average-follows": f"{str(int(dailySummary['followed'].tail(7).mean()))}",
            "weekly-average-unfollows": f"{str(int(dailySummary['unfollowed'].tail(7).mean()))}",
            "weekly-average-stories-watched": f"{str(int(dailySummary['watched'].tail(7).mean()))}",
            "weekly-average-comments-done": f"{str(int(dailySummary['comments'].tail(7).mean()))}",
            "weekly-average-pm-sent": f"{str(int(dailySummary['pm_sent'].tail(7).mean()))} ",
            "weekly-average-bottling": f"{str(int(dailySummary['duration'].tail(7).mean()))}"
        }
        try:
            r = telegram_bot_sendtext(json.dumps(statString))
        except Exception as e:
            logger(f"Failed to flush data from telegram config : {e}")


generatedReports = GenerateReports()
generatedReports.run(username=data["username"],
                     followers_now=data["followers_now"], following_now=data["following_now"])