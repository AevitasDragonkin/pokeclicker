/// <reference path="../../declarations/upgrades/Upgrade.d.ts" />
/// <reference path="../../declarations/wallet/Amount.d.ts" />

enum Upgrades {
    'Tier_Medium',
    'Tier_Hard',
    'Tier_Insane',
    'Experience_Multiplier',
    'Extra_Completion',
    'Max_Refreshes',
}

class QuestUpgrade extends Upgrade {
    static Upgrades = Upgrades;

    constructor(name: Upgrades, displayName: string, maxLevel: number, costList: Amount[], bonusList: number[], increasing = true) {
        super(name, displayName, maxLevel, costList, bonusList, increasing);
    }
}
