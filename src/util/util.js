import Message from './../message/Message';

export const SOH = '\x01';
export const STRING_EQUALS = '=';
export const RE_ESCAPE = /[.*+?^${}()|[\]\\]/g; // eslint-disable-line no-useless-escape
export const RE_FIND = /8=FIXT?\.\d\.\d([^\d]+)/i;

export const groupBy = (xs, key) =>
    xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});

export const adjustForTimezone = (date) => {
    const timeOffsetInMS = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() + timeOffsetInMS);
    return date;
};

export const timestamp = (dateObject) => {
    if (isNaN(dateObject.getTime())) {
        console.error('Invalid date specified!');
    }
    const date = adjustForTimezone(dateObject);
    return `${date.getFullYear()}${Message.pad(
        date.getMonth() + 1,
        2
    )}${Message.pad(date.getDate(), 2)}-${Message.pad(
        date.getHours(),
        2
    )}:${Message.pad(date.getMinutes(), 2)}:${Message.pad(
        date.getSeconds(),
        2
    )}.${Message.pad(date.getMilliseconds(), 3)}`;
};

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";

    let weekName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let d = this;
    let h;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|fff|ff|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "fff": return d.getMilliseconds().zf(3);
            case "ff": return d.getMilliseconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "AM" : "PM";
            default: return $1;
        }
    });
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};
