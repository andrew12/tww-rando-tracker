const flagParam = getParameterByName('f');
const gearParam = getParameterByName('g');
const versionParam = getParameterByName('v');
const progressParam = getParameterByName('p');
const isCurrentVersionParam = getParameterByName('c');

var loadingErrorShown = false;
var autoSaveInterval;

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function showLoadingError() {
  if (!loadingErrorShown) {
    if (versionParam) {
      var notificationMessage = 'Logic for Wind Waker Randomizer ' + versionParam + ' could not be loaded.';
    } else {
      var notificationMessage = 'Logic could not be loaded. Version not specified.';
    }
    $.notify(notificationMessage, {
      autoHideDelay: 5000,
      className: 'error',
      position: 'top left'
    });
    loadingErrorShown = true;
  }
}

function loadFlags() {
  if (progressParam == '1') {
    var flagString = localStorage.getItem('flags');
    if (flagString) {
      flags = flagString.split(',');
    }
    Object.keys(options).forEach(function (optionName) {
      var defaultValue = options[optionName];
      var optionType = typeof defaultValue;
      switch (optionType) {
        case 'boolean':
          options[optionName] = getLocalStorageBool(optionName, defaultValue);
          break;
        case 'number':
          options[optionName] = getLocalStorageInt(optionName, defaultValue);
          break;
        case 'string':
          options[optionName] = getLocalStorageItem(optionName, defaultValue);
          break;
      }
    });
    return;
  }

  options.key_lunacy = getParamBool('KL', options.key_lunacy);
  options.randomize_charts = getParamBool('RCH', options.randomize_charts);
  options.skip_rematch_bosses = getParamBool('SRB', options.skip_rematch_bosses);
  options.num_starting_triforce_shards = getParamInt('STS', options.num_starting_triforce_shards);
  options.race_mode = getParamBool('RM', options.race_mode);
  options.starting_gear = parseInt(gearParam);

  var entrancesValue = getParamInt('REN', 0);
  switch (entrancesValue) {
    case 0:
      options.randomize_entrances = 'Disabled';
      break;
    case 1:
      options.randomize_entrances = 'Dungeons';
      break;
    case 2:
      options.randomize_entrances = 'Secret Caves';
      break;
    case 3:
      options.randomize_entrances = 'Dungeons & Secret Caves (Separately)';
      break;
    case 4:
      options.randomize_entrances = 'Dungeons & Secret Caves (Together)';
      break;
  }

  var swordValue = getParamInt('SWO', 0);
  switch (swordValue) {
    case 0:
      options.sword_mode = 'Start with Sword';
      break;
    case 1:
      options.sword_mode = 'Randomized Sword';
      break;
    case 2:
      options.sword_mode = 'Swordless';
      break;
  }

  if (getParamBool('TRI', false)) {
    if (options.randomize_charts) {
      flags.push('Sunken Treasure');
    } else {
      flags.push('Sunken Triforce'); // need to account for this case separately
    }
  }

  checkAddFlags('D', ['Dungeon']);
  checkAddFlags('GF', ['Great Fairy']);
  checkAddFlags('PSC', ['Puzzle Secret Cave']);
  checkAddFlags('CSC', ['Combat Secret Cave']);
  checkAddFlags('SSQ', ['Short Sidequest']);
  checkAddFlags('LSQ', ['Long Sidequest']);
  checkAddFlags('ST', ['Spoils Trading']);
  checkAddFlags('MG', ['Minigame']);
  checkAddFlags('FG', ['Free Gift']);
  checkAddFlags('MAI', ['Mail']);
  checkAddFlags('PR', ['Platform', 'Raft']);
  checkAddFlags('SUB', ['Submarine']);
  checkAddFlags('ERC', ['Eye Reef Chest']);
  checkAddFlags('BOG', ['Big Octo', 'Gunboat']);
  checkAddFlags('TRE', ['Sunken Treasure']);
  checkAddFlags('EP', ['Expensive Purchase']);
  checkAddFlags('MIS', ['Other Chest', 'Misc']);
  checkAddFlags('TIN', ['Tingle Chest']);
  checkAddFlags('SAV', ['Savage Labyrinth']);
  checkAddFlags('BSM', ['Battlesquid']);
}

function getParamBool(param, defaultVal) {
  return getParamValue(param, defaultVal) == 1;
}

function getParamValue(param, defaultVal) {
  var regex = new RegExp(`${param}(\\d)`);
  var match = flagParam.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return defaultVal;
}

function getParamInt(param, defaultVal) {
  return parseInt(getParamValue(param, defaultVal));
}

function checkAddFlags(param, flagsToAdd) {
  if (getParamBool(param, false)) {
    for (var i = 0; i < flagsToAdd.length; i++) {
      var curFlag = flagsToAdd[i];
      if (!flags.includes(curFlag)) {
        flags.push(curFlag);
      }
    }
  }
}

function loadProgress() {
  if (progressParam == '1') {
    Object.keys(items).forEach(function (itemName) {
      items[itemName] = getLocalStorageInt(itemName, items[itemName]);
    });
    Object.keys(keys).forEach(function (keyName) {
      keys[keyName] = getLocalStorageInt(keyName, keys[keyName]);
    });
    Object.keys(locationsChecked).forEach(function (generalLocation) {
      Object.keys(locationsChecked[generalLocation]).forEach(function (detailedLocation) {
        var locationName = getFullLocationName(generalLocation, detailedLocation);
        locationsChecked[generalLocation][detailedLocation] = getLocalStorageBool(locationName, false);
      });
    });
    var allEntrances = getAllRandomEntrances();
    for (var i = 0; i < allEntrances.length; i++) {
      var curExit = allEntrances[i];
      var entranceName = getLocalStorageItem(curExit, "");
      entrances[curExit] = entranceName;
    }

    if (isCurrentVersionParam == '1') {
      var notificationMessage = 'Progress loaded.';
    } else {
      var notificationMessage = 'Progress loaded for Wind Waker Randomizer ' + versionParam + '.'
    }
    $.notify(notificationMessage, {
      autoHideDelay: 5000,
      className: 'success',
      position: 'top left'
    });
  }
}

function getLocalStorageInt(itemName, defaultVal) {
  return parseInt(getLocalStorageItem(itemName, defaultVal));
}

function getLocalStorageBool(itemName, defaultVal) {
  return getLocalStorageItem(itemName, defaultVal) == 'true';
}

function getLocalStorageItem(itemName, defaultVal) {
  var itemValue = localStorage.getItem(itemName);
  if (itemValue) {
    return itemValue;
  }
  return defaultVal.toString();
}

function saveProgress() {
  Object.keys(items).forEach(function (itemName) {
    localStorage.setItem(itemName, items[itemName]);
  });
  Object.keys(keys).forEach(function (keyName) {
    localStorage.setItem(keyName, keys[keyName]);
  });
  Object.keys(locationsChecked).forEach(function (generalLocation) {
    Object.keys(locationsChecked[generalLocation]).forEach(function (detailedLocation) {
      var locationName = getFullLocationName(generalLocation, detailedLocation);
      var locationValue = locationsChecked[generalLocation][detailedLocation];
      localStorage.setItem(locationName, locationValue);
    });
  });
  var allEntrances = getAllRandomEntrances();
  for (var i = 0; i < allEntrances.length; i++) {
    var curExit = allEntrances[i];
    localStorage.setItem(curExit, entrances[curExit]);
  }
  localStorage.setItem('flags', flags.join(','));
  Object.keys(options).forEach(function (optionName) {
    localStorage.setItem(optionName, options[optionName]);
  });
  localStorage.setItem('version', versionParam);
}
