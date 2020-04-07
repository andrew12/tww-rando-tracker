import _ from 'lodash';

import TEST_ITEM_LOCATIONS from '../data/test-item-locations';
import TEST_MACROS from '../data/test-macros';

import Locations from './locations';
import LogicCalculation from './logic-calculation';
import LogicHelper from './logic-helper';
import LogicTweaks from './logic-tweaks';
import Macros from './macros';
import Settings from './settings';
import TrackerState from './tracker-state';

describe('LogicCalculation', () => {
  let logic;

  const setLocations = (locationsList) => {
    Locations.locations = locationsList;
    LogicHelper.reset();
  };

  beforeEach(() => {
    logic = new LogicCalculation(TrackerState.default());
  });

  afterEach(() => {
    Locations.reset();
    LogicHelper.reset();
    Macros.reset();
    Settings.reset();
  });

  describe('constructor', () => {
    beforeEach(() => {
      Settings.initialize({
        options: {
          keyLunacy: false,
          numStartingTriforceShards: 0,
          raceMode: false,
          randomizeCharts: false,
          skipRematchBosses: true,
          startingGear: 0,
          swordMode: 'Start with Sword'
        }
      });

      Locations.initialize(TEST_ITEM_LOCATIONS);
      LogicTweaks.updateLocations();

      Macros.initialize(TEST_MACROS);
      LogicTweaks.updateMacros();

      LogicHelper.initialize();
    });

    describe('setting guaranteed keys', () => {
      let state;

      describe('when doing key lunacy', () => {
        beforeEach(() => {
          Settings.initialize({
            options: {
              keyLunacy: true
            }
          });

          state = TrackerState.default();
        });

        test('sets no guaranteed keys', () => {
          logic = new LogicCalculation(state);

          expect(logic.guaranteedKeys).toEqual({
            'DRC Small Key': 0,
            'DRC Big Key': 0,
            'FW Small Key': 0,
            'FW Big Key': 0,
            'TotG Small Key': 0,
            'TotG Big Key': 0,
            'ET Small Key': 0,
            'ET Big Key': 0,
            'WT Small Key': 0,
            'WT Big Key': 0
          });
        });
      });

      describe('when only having the default items', () => {
        beforeEach(() => {
          state = TrackerState.default();
        });

        test('sets the guaranteed keys', () => {
          logic = new LogicCalculation(state);

          expect(logic.guaranteedKeys).toEqual({
            'DRC Small Key': 1,
            'DRC Big Key': 0,
            'FW Small Key': 0,
            'FW Big Key': 0,
            'TotG Small Key': 0,
            'TotG Big Key': 0,
            'ET Small Key': 0,
            'ET Big Key': 0,
            'WT Small Key': 0,
            'WT Big Key': 0
          });
        });

        test('shows the unlocked locations as available', () => {
          logic = new LogicCalculation(state);

          const isLocationAvailable = logic.isLocationAvailable('Dragon Roost Cavern', 'Boarded Up Chest');

          expect(isLocationAvailable).toEqual(true);
        });
      });

      describe('when setting the DRC Big Key Chest as checked', () => {
        beforeEach(() => {
          state = TrackerState.default()
            .setLocationChecked('Dragon Roost Cavern', 'Big Key Chest', true);
        });

        test('guarantees 2 small keys in DRC', () => {
          logic = new LogicCalculation(state);

          expect(logic.guaranteedKeys).toEqual({
            'DRC Small Key': 2,
            'DRC Big Key': 0,
            'FW Small Key': 0,
            'FW Big Key': 0,
            'TotG Small Key': 0,
            'TotG Big Key': 0,
            'ET Small Key': 0,
            'ET Big Key': 0,
            'WT Small Key': 0,
            'WT Big Key': 0
          });
        });
      });

      describe('when having the required items for DRC', () => {
        beforeEach(() => {
          state = TrackerState.default()
            .setItemValue('Grappling Hook', 1)
            .setItemValue('Deku Leaf', 1);
        });

        test('guarantees all the keys for DRC', () => {
          logic = new LogicCalculation(state);

          expect(logic.guaranteedKeys).toEqual({
            'DRC Small Key': 4,
            'DRC Big Key': 1,
            'FW Small Key': 0,
            'FW Big Key': 0,
            'TotG Small Key': 0,
            'TotG Big Key': 0,
            'ET Small Key': 0,
            'ET Big Key': 0,
            'WT Small Key': 0,
            'WT Big Key': 0
          });
        });
      });

      describe('when having 2 DRC small keys', () => {
        beforeEach(() => {
          state = TrackerState.default()
            .setItemValue('DRC Small Key', 2);
        });

        test('does not guarantee any additional keys in DRC', () => {
          logic = new LogicCalculation(state);

          expect(logic.guaranteedKeys).toEqual({
            'DRC Small Key': 2,
            'DRC Big Key': 0,
            'FW Small Key': 0,
            'FW Big Key': 0,
            'TotG Small Key': 0,
            'TotG Big Key': 0,
            'ET Small Key': 0,
            'ET Big Key': 0,
            'WT Small Key': 0,
            'WT Big Key': 0
          });
        });
      });

      describe('when having the required items for DRC and FW', () => {
        beforeEach(() => {
          state = TrackerState.default()
            .setItemValue('Boomerang', 1)
            .setItemValue('Grappling Hook', 1)
            .setItemValue('Deku Leaf', 1);
        });

        test('guarantees all the keys for DRC and FW', () => {
          logic = new LogicCalculation(state);

          expect(logic.guaranteedKeys).toEqual({
            'DRC Small Key': 4,
            'DRC Big Key': 1,
            'FW Small Key': 1,
            'FW Big Key': 1,
            'TotG Small Key': 0,
            'TotG Big Key': 0,
            'ET Small Key': 0,
            'ET Big Key': 0,
            'WT Small Key': 0,
            'WT Big Key': 0
          });
        });
      });

      describe('when checking or unlocking all potential key locations in FW', () => {
        beforeEach(() => {
          state = TrackerState.default()
            .setItemValue('Grappling Hook', 1)
            .setItemValue('Deku Leaf', 1)
            .setItemValue('Hookshot', 1)
            .setLocationChecked('Forbidden Woods', 'Chest Across Red Hanging Flower', true)
            .setLocationChecked('Forbidden Woods', 'Chest in Locked Tree Trunk', true)
            .setLocationChecked('Forbidden Woods', 'Big Key Chest', true);
        });

        test('guarantees all the keys in FW', () => {
          logic = new LogicCalculation(state);

          expect(logic.guaranteedKeys).toEqual({
            'DRC Small Key': 4,
            'DRC Big Key': 1,
            'FW Small Key': 1,
            'FW Big Key': 1,
            'TotG Small Key': 0,
            'TotG Big Key': 0,
            'ET Small Key': 0,
            'ET Big Key': 0,
            'WT Small Key': 0,
            'WT Big Key': 0
          });
        });
      });
    });
  });

  describe('isLocationAvailable', () => {
    describe('when the location is checked', () => {
      beforeEach(() => {
        setLocations({
          'Outset Island': {
            'Savage Labyrinth - Floor 30': {
              need: 'Deku Leaf & Grappling Hook'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state.setLocationChecked('Outset Island', 'Savage Labyrinth - Floor 30', true)
        );
      });

      test('returns true', () => {
        const isLocationAvailable = logic.isLocationAvailable('Outset Island', 'Savage Labyrinth - Floor 30');

        expect(isLocationAvailable).toEqual(true);
      });
    });

    describe('when the location requirements are met', () => {
      beforeEach(() => {
        setLocations({
          'Outset Island': {
            'Savage Labyrinth - Floor 30': {
              need: 'Deku Leaf & Grappling Hook'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state
            .setItemValue('Grappling Hook', 1)
            .setItemValue('Deku Leaf', 1)
        );
      });

      test('returns true', () => {
        const isLocationAvailable = logic.isLocationAvailable('Outset Island', 'Savage Labyrinth - Floor 30');

        expect(isLocationAvailable).toEqual(true);
      });
    });

    describe('when the location requirements are not met', () => {
      beforeEach(() => {
        setLocations({
          'Outset Island': {
            'Savage Labyrinth - Floor 30': {
              need: 'Deku Leaf & Grappling Hook'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state
            .setItemValue('Grappling Hook', 0)
            .setItemValue('Deku Leaf', 1)
        );
      });

      test('returns false', () => {
        const isLocationAvailable = logic.isLocationAvailable('Outset Island', 'Savage Labyrinth - Floor 30');

        expect(isLocationAvailable).toEqual(false);
      });
    });
  });

  describe('itemsRemainingForLocation', () => {
    describe('when the location is checked', () => {
      beforeEach(() => {
        setLocations({
          'Outset Island': {
            'Savage Labyrinth - Floor 30': {
              need: 'Deku Leaf & Grappling Hook'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state.setLocationChecked('Outset Island', 'Savage Labyrinth - Floor 30', true)
        );
      });

      test('returns 0', () => {
        const isLocationAvailable = logic.itemsRemainingForLocation('Outset Island', 'Savage Labyrinth - Floor 30');

        expect(isLocationAvailable).toEqual(0);
      });
    });

    describe('when multiple items are all required', () => {
      beforeEach(() => {
        setLocations({
          "Ganon's Tower": {
            'Defeat Ganondorf': {
              need: 'Triforce Shard x8 & Progressive Sword x4 & Progressive Bow x3 & Boomerang & Grappling Hook & Hookshot'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state
            .setItemValue('Triforce Shard', 1)
            .setItemValue('Progressive Sword', 1)
            .setItemValue('Grappling Hook', 1)
        );
      });

      test('returns the number of items remaining for the location', () => {
        const itemsRemaining = logic.itemsRemainingForLocation("Ganon's Tower", 'Defeat Ganondorf');

        expect(itemsRemaining).toEqual(15);
      });
    });

    describe('when at least one of the items is required', () => {
      beforeEach(() => {
        setLocations({
          "Ganon's Tower": {
            'Defeat Ganondorf': {
              need: 'Triforce Shard x8 | Progressive Sword x4 | Progressive Bow x3 | Boomerang | Grappling Hook | Hookshot'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state
            .setItemValue('Triforce Shard', 1)
            .setItemValue('Progressive Sword', 1)
            .setItemValue('Grappling Hook', 1)
        );
      });

      test('returns the number of items remaining for the location', () => {
        const itemsRemaining = logic.itemsRemainingForLocation("Ganon's Tower", 'Defeat Ganondorf');

        expect(itemsRemaining).toEqual(7);
      });
    });
  });

  describe('_smallKeysRequiredForLocation', () => {
    describe('when the location has no requirements', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'Nothing'
            }
          }
        });
      });

      test('returns 0', () => {
        const keysRequired = LogicCalculation._smallKeysRequiredForLocation('Dragon Roost Cavern', 'First Room');

        expect(keysRequired).toEqual(0);
      });
    });

    describe('when the location only has non-key requirements', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'Grappling Hook'
            }
          }
        });
      });

      test('returns 0', () => {
        const keysRequired = LogicCalculation._smallKeysRequiredForLocation('Dragon Roost Cavern', 'First Room');

        expect(keysRequired).toEqual(0);
      });
    });

    describe('when the location only requires a small key', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'DRC Small Key x1'
            }
          }
        });
      });

      test('returns the 1 small key', () => {
        const keysRequired = LogicCalculation._smallKeysRequiredForLocation('Dragon Roost Cavern', 'First Room');

        expect(keysRequired).toEqual(1);
      });
    });

    describe('when the location requires some keys and some other items', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'Grappling Hook & Deku Leaf & DRC Small Key x2 & DRC Big Key'
            }
          }
        });
      });

      test('returns the number of small keys', () => {
        const keysRequired = LogicCalculation._smallKeysRequiredForLocation('Dragon Roost Cavern', 'First Room');

        expect(keysRequired).toEqual(2);
      });
    });

    describe('when the location has nested key requirements', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'Big Key Chest': {
              need: 'DRC Small Key x1 & Grappling Hook & (DRC Small Key x4 | Deku Leaf | Progressive Bow x2)'
            }
          }
        });
      });

      test('returns the number of small keys that are strictly required', () => {
        const keysRequired = LogicCalculation._smallKeysRequiredForLocation('Dragon Roost Cavern', 'Big Key Chest');

        expect(keysRequired).toEqual(1);
      });
    });
  });

  describe('_nonKeyRequirementsMetForLocation', () => {
    describe('when the location is checked', () => {
      beforeEach(() => {
        logic = new LogicCalculation(
          logic.state.setLocationChecked('Dragon Roost Cavern', 'First Room', true)
        );
      });

      test('returns true', () => {
        const nonKeyRequirementsMet = logic._nonKeyRequirementsMetForLocation('Dragon Roost Cavern', 'First Room');

        expect(nonKeyRequirementsMet).toEqual(true);
      });
    });

    describe('when the location has no requirements', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'Nothing'
            }
          }
        });
      });

      test('returns true', () => {
        const nonKeyRequirementsMet = logic._nonKeyRequirementsMetForLocation('Dragon Roost Cavern', 'First Room');

        expect(nonKeyRequirementsMet).toEqual(true);
      });
    });

    describe('when the location requires an item that is not obtained yet', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'Grappling Hook & DRC Big Key'
            }
          }
        });
      });

      test('returns false', () => {
        const nonKeyRequirementsMet = logic._nonKeyRequirementsMetForLocation('Dragon Roost Cavern', 'First Room');

        expect(nonKeyRequirementsMet).toEqual(false);
      });
    });

    describe('when the location only requires a small key', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'DRC Small Key x1'
            }
          }
        });
      });

      test('returns true', () => {
        const nonKeyRequirementsMet = logic._nonKeyRequirementsMetForLocation('Dragon Roost Cavern', 'First Room');

        expect(nonKeyRequirementsMet).toEqual(true);
      });
    });

    describe('when all non-key requirements are met', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'First Room': {
              need: 'DRC Small Key x1 & Grappling Hook & Deku Leaf'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state
            .setItemValue('Grappling Hook', 1)
            .setItemValue('Deku Leaf', 1)
        );
      });

      test('returns true', () => {
        const nonKeyRequirementsMet = logic._nonKeyRequirementsMetForLocation('Dragon Roost Cavern', 'First Room');

        expect(nonKeyRequirementsMet).toEqual(true);
      });
    });

    describe('when the only non-key requirements are obsoleted by a key requirement', () => {
      beforeEach(() => {
        setLocations({
          'Dragon Roost Cavern': {
            'Big Key Chest': {
              need: 'DRC Small Key x1 & Grappling Hook & (DRC Small Key x4 | Deku Leaf | Progressive Bow x2)'
            }
          }
        });

        logic = new LogicCalculation(
          logic.state.setItemValue('Grappling Hook', 1)
        );
      });

      test('returns true', () => {
        const nonKeyRequirementsMet = logic._nonKeyRequirementsMetForLocation('Dragon Roost Cavern', 'Big Key Chest');

        expect(nonKeyRequirementsMet).toEqual(true);
      });
    });
  });

  describe('_isRequirementMet', () => {
    describe('when the requirement is nothing', () => {
      test('returns true', () => {
        const isItemAvailable = logic._isRequirementMet('Nothing');

        expect(isItemAvailable).toEqual(true);
      });
    });

    describe('when the requirement is nothing', () => {
      test('returns false', () => {
        const isItemAvailable = logic._isRequirementMet('Impossible');

        expect(isItemAvailable).toEqual(false);
      });
    });

    describe('when the requirement is a normal item', () => {
      describe('when the item is available', () => {
        beforeEach(() => {
          logic = new LogicCalculation(
            logic.state.setItemValue('Deku Leaf', 1)
          );
        });

        test('returns true', () => {
          const isItemAvailable = logic._isRequirementMet('Deku Leaf');

          expect(isItemAvailable).toEqual(true);
        });
      });

      describe('when the item is not available', () => {
        beforeEach(() => {
          logic = new LogicCalculation(
            logic.state.setItemValue('Deku Leaf', 0)
          );
        });

        test('returns false', () => {
          const isItemAvailable = logic._isRequirementMet('Deku Leaf');

          expect(isItemAvailable).toEqual(false);
        });
      });
    });

    describe('when the requirement is a progressive item', () => {
      describe('when the item count meets the requirement', () => {
        beforeEach(() => {
          logic = new LogicCalculation(
            logic.state.setItemValue('Progressive Sword', 3)
          );
        });

        test('returns true', () => {
          const isItemAvailable = logic._isRequirementMet('Progressive Sword x3');

          expect(isItemAvailable).toEqual(true);
        });
      });

      describe('when the item count does not meet the requirement', () => {
        beforeEach(() => {
          logic = new LogicCalculation(
            logic.state.setItemValue('Triforce Shard', 4)
          );
        });

        test('returns false', () => {
          const isItemAvailable = logic._isRequirementMet('Triforce Shard x5');

          expect(isItemAvailable).toEqual(false);
        });
      });
    });

    describe('when the requirement is a small key', () => {
      describe('when the key count meets the requirement', () => {
        beforeEach(() => {
          _.set(logic.guaranteedKeys, 'DRC Small Key', 2);
        });

        test('returns true', () => {
          const isItemAvailable = logic._isRequirementMet('DRC Small Key x2');

          expect(isItemAvailable).toEqual(true);
        });
      });

      describe('when the key count does not meet the requirement', () => {
        beforeEach(() => {
          _.set(logic.guaranteedKeys, 'DRC Small Key', 1);
        });

        test('returns false', () => {
          const isItemAvailable = logic._isRequirementMet('DRC Small Key x2');

          expect(isItemAvailable).toEqual(false);
        });
      });
    });

    describe('when the requirement is having accessed another location', () => {
      beforeEach(() => {
        setLocations({
          'Outset Island': {
            'Savage Labyrinth - Floor 30': {
              need: 'Grappling Hook'
            }
          }
        });
      });

      describe('when the other location has not been checked', () => {
        beforeEach(() => {
          logic = new LogicCalculation(
            logic.state.setLocationChecked('Outset Island', 'Savage Labyrinth - Floor 30', false)
          );
        });

        test('returns false', () => {
          const isItemAvailable = logic._isRequirementMet(
            'Has Accessed Other Location "Outset Island - Savage Labyrinth - Floor 30"'
          );

          expect(isItemAvailable).toEqual(false);
        });
      });

      describe('when the other location has been checked', () => {
        beforeEach(() => {
          logic = new LogicCalculation(
            logic.state.setLocationChecked('Outset Island', 'Savage Labyrinth - Floor 30', true)
          );
        });

        test('returns true', () => {
          const isItemAvailable = logic._isRequirementMet(
            'Has Accessed Other Location "Outset Island - Savage Labyrinth - Floor 30"'
          );

          expect(isItemAvailable).toEqual(true);
        });
      });

      describe('when the requirements for the other location have been met', () => {
        beforeEach(() => {
          logic = new LogicCalculation(
            logic.state.setItemValue('Grappling Hook', 1)
          );
        });

        test('returns true', () => {
          const isItemAvailable = logic._isRequirementMet(
            'Has Accessed Other Location "Outset Island - Savage Labyrinth - Floor 30"'
          );

          expect(isItemAvailable).toEqual(true);
        });
      });
    });
  });
});
