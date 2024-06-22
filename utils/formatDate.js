const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
};

const formatMonthAndYear = (date) => {
    let d = new Date(date);
    let m = d.toLocaleString("id-ID", { month: "long" });
    let y = d.getFullYear();

    return `${m} ${y}`;
};

const formatTime = (date) => {
    const d = new Date(date);
    return d.toTimeString().split(" ")[0].slice(0, 5);
};

const toWib = (date) => {
    const dateTime = new Date(date);
    return new Date(dateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
};

module.exports = {
    formatDate,
    formatTime,
    formatMonthAndYear,
    toWib,
};
