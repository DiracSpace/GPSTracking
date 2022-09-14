const Months = {
    1: {
        en: 'January',
        es: 'Enero'
    },
    2: {
        en: 'February',
        es: 'Febrero'
    },
    3: {
        en: 'March',
        es: 'Marzo'
    },
    4: {
        en: 'April',
        es: 'Abril'
    },
    5: {
        en: 'May',
        es: 'Mayo'
    },
    6: {
        en: 'June',
        es: 'Junio'
    },
    7: {
        en: 'July',
        es: 'Julio'
    },
    8: {
        en: 'August',
        es: 'Agosto'
    },
    9: {
        en: 'September',
        es: 'Septiembre'
    },
    10: {
        en: 'October',
        es: 'Octubre'
    },
    11: {
        en: 'November',
        es: 'Noviembre'
    },
    12: {
        en: 'December',
        es: 'Diciembre'
    }
};

const padZeros = (num: number, length: number): string => {
    return String(num).padStart(length, '0');
};

export function DDMMYYYYHHmmssLong(
    date: Date | string,
    options?: { lang?: string }
): string {
    const lang = options?.lang ?? 'en';
    const d = new Date(date);

    const monthName = Months[d.getMonth()][lang];
    const datePart = `${d.getDate()} de ${monthName} del ${d.getFullYear()}`;

    const hours = padZeros(d.getHours(), 2);
    const minutes = padZeros(d.getMinutes(), 2);
    const seconds = padZeros(d.getSeconds(), 2);
    const timePart = `${hours}:${minutes}:${seconds}`;

    return `${datePart} a las ${timePart}`;
}
