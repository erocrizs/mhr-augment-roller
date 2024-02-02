// 0 <= return < int
export function getRandomIntLessThan(int) {
    return Math.floor(Math.random() * int);
}

// min <= return < max
export function getRandomIntBetween(min, max) {
    return min + getRandomIntLessThan(max - min);
}

export function getRandomFromList(list) {
    const index = getRandomIntLessThan(list.length);
    return [
        list[index],
        index 
    ];
}

export function getRandomFromObject(object) {
    const keyList = Object.keys(object);
    const [key] = getRandomFromList(keyList);
    return [
        object[key],
        key
    ];
}

export class ListRandom {
    constructor(list) {
        this.list = list;
    }

    getRandom() {
        return getRandomFromList(this.list);
    }
}

export class ObjectRandom {
    #kl = null;

    constructor(object) {
        this.object = object;
    }

    getRandom() {
        if (!this.#kl) {
            this.#kl = new ListRandom(Object.keys(object));
        }

        const [key] = this.#kl.getRandom();
        return [
            this.object[key],
            key
        ];
    }
}

// qualifier(v) - returns + when v is too big, - when v is too small, 0 when exact
function binarySearch(sortedList, qualifier) {
    function search(min, max) {
        console.log(`searching between ${min} and ${max}`);
        if (max < min) {
            console.log(`cant find`);
            return [null, -1];
        }

        const idx = Math.floor((min + max) / 2);
        const result = qualifier(sortedList[idx]);
        
        if (result < 0) {
            // idx is too low
            return search(idx + 1, max);
        }

        if (result > 0) {
            // idx is too high
            return search(min, idx - 1);
        }

        return [
            sortedList[idx],
            idx
        ];
    }

    return search(0, sortedList.length - 1);
}

export class WeightedListRandom {
    #weightedList = null;

    constructor(list, predicate) {
        this.list = list;
        this.predicate = predicate;
    }

    static #createWeightedList(list, predicate) {
        const weightedList = [];

        let currentPointer = 0;
        for (let item of list) {
            let weight = predicate(item);
            let next = currentPointer + weight;
            weightedList.push({
                min: currentPointer, // range inclusive
                max: next, // range exclusive
                item,
            });
            currentPointer = next;
        }

        return weightedList;
    }

    getRandom() {
        if (!this.#weightedList) {
            this.#weightedList = WeightedListRandom.#createWeightedList(
                this.list,
                this.predicate
            );
        }

        const lastEntry = this.#weightedList[this.#weightedList.length - 1];
        const ptr = getRandomIntLessThan(lastEntry.max);
        const [{ item }, index] = binarySearch(
            this.#weightedList,
            ({min, max}) => (min > ptr) ? 1 : ((max < ptr) ? -1 : 0)
        );

        return [ item, index ];
    }
}

export class WeightedObjectRandom {
    #wlr = null;

    constructor(object, predicate) {
        this.object = object;
        this.predicate = predicate;
    }

    getRandom() {
        if (!this.#wlr) {
            const listForm = Object.keys(this.object).map(key => ({
                key,
                value: this.object[key],
                weight: this.predicate(this.object[key])
            }));
            this.#wlr = new WeightedListRandom(listForm, i => i.weight);
        }

        const [ { key } ] = this.#wlr.getRandom();
        return [ this.object[key], key ];
    }
}
