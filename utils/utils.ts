export const formatDate = (date: number | Date) => {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
}
export const oneWeekAway = () => {
    const now = new Date();
    const inOneWeek = now.setDate(now.getDate() + 7);
    return new Date(inOneWeek);
}

// Netlify url : https://64afab9cb65fd600085d9c17--kaleidoscopic-semifreddo-dcb21f.netlify.app/
// Vercel url : https://sinteza.vercel.app/
export const URLcondition =
    process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : "https://64afab9cb65fd600085d9c17--kaleidoscopic-semifreddo-dcb21f.netlify.app/";