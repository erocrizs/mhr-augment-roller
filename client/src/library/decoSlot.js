export function parse(decoString) {
    const parsedDecos = decoString.split('').map(Number);
    while (parsedDecos.length < 3) {
        parsedDecos.push(0);
    }
    return parsedDecos;
}

export function stringify(decoList) {
    return decoList.filter(s => s > 0).join('');
}

export function levelUpgradeToList(decoList, level) {
    const upgradeList = [0, 0, 0];

    for (let i = 0; i <= 2 && level > 0; i++) {
        if (decoList[i] === 0) {
            upgradeList[i] = 1;
            level--;
        }
    }

    for (let i = 0; i <= 2 && level > 0; i++) {
        while (level > 0 && (upgradeList[i] + decoList[i]) < 4) {
            const toUpgrade = Math.min(level, 4 - (upgradeList[i] + decoList[i]));
            upgradeList[i] += toUpgrade;
            level -= toUpgrade;
        }
    }

    return upgradeList;
}

const DecoSlot = { parse, stringify, levelUpgradeToList };

export default DecoSlot;