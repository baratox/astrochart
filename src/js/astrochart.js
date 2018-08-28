"use strict";

const defaultSettings = {
    'sprites-base-url': "/dist/image",
    'signs': ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra",
               "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"],
}

function toDegree(position) {
    if (position) {
        return position > 0 ? position % 360 : 360 + (position % 360)
    } else {
        return 0
    }
}

function iterateIfCollection(argument, value, callback) {
    if (typeof argument  === "object") {
        var updated = {}
        for (var key in argument) {
            updated[key] = callback(key, argument[key])
        }

        return updated

    } else if (typeof argument === "string" || typeof argument === "number") {
        return callback(argument, value)
    }
}


class AstroEvent {
    constructor(chart, ascendant, orbs, houses) {
        this.chart = chart

        this.event = {
            ascendant: ascendant || 0,
            orbs: orbs || {
                'sun': 0,
                'moon': 0,
                'mercury': 0,
                'venus': 0,
                'mars': 0,
                'jupiter': 0,
                'saturn': 0,
                'uranus': 0,
                'neptune': 0,
                'pluto': 0,
            },
            houses: houses || {
                1: 0,
                2: 30,
                3: 60,
                4: 90,
                5: 120,
                6: 150,
                7: 180,
                8: 210,
                9: 240,
                10: 270,
                11: 300,
                12: 330,
            }
        }
    }

    getHouseAt(position) {
        position = toDegree(position)
        for (var i = 1; i <= 12; i++) {
            var begin = this.event.houses[i]
            var next = i < 12 ? this.event.houses[i + 1] : this.event.houses[1]
            if (begin < next) {
                if (position >= begin && position < next) {
                    return i
                }
            } else {
                if (position >= begin || position < next) {
                    return i
                }
            }
        }

        return undefined
    }

    describe(position) {
        position = toDegree(position)
        return $.extend(this.chart.describe(position), {
            'house': this.getHouseAt(position),
        })
    }

    ascendant(position) {
        if (position !== undefined) {
            position = toDegree(position);
            this.event.ascendant = position;
            this.chart.theme.ascendant(position)
        }

        return this.describe(this.event.ascendant)
    }

    orb(orbs, position) {
        return iterateIfCollection(orbs, position, (orb, position) => {
            if (position !== undefined) {
                position = toDegree(position + this.event.ascendant);
                this.event.orbs[orb] = position;
                this.chart.theme.astro(orb, position);
            }

            return this.describe(this.event.orbs[orb])
        })
    }

    house(houses, position) {
        var result = iterateIfCollection(houses, position, (house, position) => {
            if (position !== undefined) {
                position = toDegree(this.event.ascendant - position);
                this.event.houses[house] = position;
                this.chart.theme.house(house, position);
            }

            return this.event.houses[house];
        });

        this.chart.theme.invalidate();
        return result;
    }
}

class Astrochart {

    constructor(settings) {
        this.settings = $.extend(defaultSettings, settings)
        this.theme = new Astrochart.AstrochartTheme(this.settings)
        this.events = [new AstroEvent(this)]
    }

    describe(position) {
        return {
            position,
            sign: this.settings.signs[Math.floor(position / 30)],
        }
    }

    event(index) {
        if (index !== undefined) {
            return this.events[index]

        } else {
            return this.events[0]
        }
    }

    aspect(aspects) {
        return iterateIfCollection(aspects, null, (i, aspect) => {
            this.theme.aspect(aspect.a, aspect.b, aspect.value, aspect.classes);
            return aspect
        })
    }
}


window.Astrochart = Astrochart
