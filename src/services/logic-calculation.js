import _ from 'lodash';

import KEYS from '../data/keys';

import Locations from './locations';
import LogicHelper from './logic-helper';
import Memoizer from './memoizer';

export default class LogicCalculation {
  constructor(state) {
    this.state = state;

    Memoizer.memoize(this, ['isLocationAvailable']);

    this._setGuaranteedKeys();
  }

  isLocationAvailable(generalLocation, detailedLocation) {
    if (this.state.isLocationChecked(generalLocation, detailedLocation)) {
      return true;
    }

    const requirementsForLocation = LogicHelper.requirementsForLocation(
      generalLocation,
      detailedLocation
    );

    return requirementsForLocation.evaluate({
      isItemTrue: (requirement) => this._isRequirementMet(requirement)
    });
  }

  itemsRemainingForLocation(generalLocation, detailedLocation) {
    if (this.state.isLocationChecked(generalLocation, detailedLocation)) {
      return 0;
    }

    const requirementsForLocation = LogicHelper.requirementsForLocation(
      generalLocation,
      detailedLocation
    );

    return requirementsForLocation.reduce({
      andInitialValue: 0,
      andReducer: ({
        accumulator,
        item,
        isReduced
      }) => accumulator + (isReduced ? item : this._itemsRemainingForRequirement(item)),
      orInitialValue: 0,
      orReducer: ({
        accumulator,
        item,
        isReduced
      }) => Math.max(accumulator, (isReduced ? item : this._itemsRemainingForRequirement(item)))
    });
  }

  _setGuaranteedKeys() {
    this.guaranteedKeys = _.reduce(
      _.keys(KEYS),
      (accumulator, keyName) => _.set(accumulator, keyName, this.state.getItemValue(keyName)),
      {}
    );
  }

  _isRequirementMet(requirement) {
    const itemsRemaining = this._itemsRemainingForRequirement(requirement);
    return itemsRemaining === 0;
  }

  _itemsRemainingForRequirement(requirement) {
    const remainingItemsForRequirements = [
      LogicCalculation._impossibleRequirementRemaining(requirement),
      LogicCalculation._nothingRequirementRemaining(requirement),
      this._itemCountRequirementRemaining(requirement),
      this._itemRequirementRemaining(requirement),
      this._hasAccessedOtherLocationRequirementRemaining(requirement)
    ];

    const remainingItems = _.find(remainingItemsForRequirements, (result) => !_.isNil(result));

    if (!_.isNil(remainingItems)) {
      return remainingItems;
    }
    throw Error(`Could not parse requirement: ${requirement}`);
  }

  static _impossibleRequirementRemaining(requirement) {
    if (requirement === LogicHelper.TOKENS.IMPOSSIBLE) {
      return 1;
    }

    return null;
  }

  static _nothingRequirementRemaining(requirement) {
    if (requirement === LogicHelper.TOKENS.NOTHING) {
      return 0;
    }

    return null;
  }

  _itemCountRequirementRemaining(requirement) {
    const itemCountRequirement = LogicCalculation._parseItemCountRequirement(requirement);
    if (!_.isNil(itemCountRequirement)) {
      const {
        countRequired,
        itemName
      } = itemCountRequirement;

      const itemCount = this._currentItemValue(itemName);
      return Math.max(countRequired - itemCount, 0);
    }

    return null;
  }

  _itemRequirementRemaining(requirement) {
    const itemValue = this._currentItemValue(requirement);
    if (!_.isNil(itemValue)) {
      if (itemValue > 0) {
        return 0;
      }
      return 1;
    }

    return null;
  }

  _hasAccessedOtherLocationRequirementRemaining(requirement) {
    const otherLocationMatch = requirement.match(/Has Accessed Other Location "([^"]+)"/);
    if (otherLocationMatch) {
      const {
        generalLocation,
        detailedLocation
      } = Locations.splitLocationName(otherLocationMatch[1]);

      return this.itemsRemainingForLocation(generalLocation, detailedLocation);
    }

    return null;
  }

  _currentItemValue(itemName) {
    const guaranteedKeyCount = _.get(this.guaranteedKeys, itemName);
    if (!_.isNil(guaranteedKeyCount)) {
      return guaranteedKeyCount;
    }

    return this.state.getItemValue(itemName);
  }

  static _parseItemCountRequirement(requirement) {
    const itemCountRequirementMatch = requirement.match(/((?:\w|\s)+) x(\d)/);

    if (itemCountRequirementMatch) {
      return {
        itemName: itemCountRequirementMatch[1],
        countRequired: _.toSafeInteger(itemCountRequirementMatch[2])
      };
    }

    return null;
  }
}