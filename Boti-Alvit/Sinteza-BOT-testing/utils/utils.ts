export const formatDate = (date: number | Date) => {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
}
export const oneWeekAway = () => {
    const now = new Date();
    const inOneWeek = now.setDate(now.getDate() + 7);
    return new Date(inOneWeek);
}

export const URLcondition =
    process.env.NODE_ENV === "development"
        ? ""
        : "https://sinteza.vercel.app/";