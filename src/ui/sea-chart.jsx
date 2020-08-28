import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

import ISLANDS from "../data/islands.json";
import LogicCalculation from "../services/logic-calculation";
import LogicHelper from "../services/logic-helper";
import TrackerState from "../services/tracker-state";

import Images from "./images";
import Sector from "./sector";

class SeaChart extends React.PureComponent {
  sector(island) {
    const {
      clearSelectedItem,
      clearSelectedLocation,
      disableLogic,
      incrementItem,
      logic,
      onlyProgressLocations,
      setOpenedLocation,
      setSelectedItem,
      setSelectedLocation,
      trackerState,
    } = this.props;

    const { chartName, chartType } = LogicHelper.chartForIsland(island);

    const chartCount = trackerState.getItemValue(chartName);

    const { color, numAvailable, numRemaining } = logic.locationCounts(island, {
      isDungeon: false,
      onlyProgressLocations,
      disableLogic,
    });

    return (
      <Sector
        chartCount={chartCount}
        chartName={chartName}
        chartType={chartType}
        color={color}
        disableLogic={disableLogic}
        clearSelectedItem={clearSelectedItem}
        clearSelectedLocation={clearSelectedLocation}
        key={island}
        incrementItem={incrementItem}
        island={island}
        numAvailable={numAvailable}
        numRemaining={numRemaining}
        setOpenedLocation={setOpenedLocation}
        setSelectedItem={setSelectedItem}
        setSelectedLocation={setSelectedLocation}
      />
    );
  }

  render() {
    const islands = _.map(ISLANDS, (island) => this.sector(island));

    return (
      <div className="chart-map">
        <div className="chart-map-background">
          <img src={Images.IMAGES.SEA_CHART} alt="" />
        </div>
        <div className="maps">{islands}</div>
      </div>
    );
  }
}

SeaChart.propTypes = {
  clearSelectedItem: PropTypes.func.isRequired,
  clearSelectedLocation: PropTypes.func.isRequired,
  disableLogic: PropTypes.bool.isRequired,
  incrementItem: PropTypes.func.isRequired,
  logic: PropTypes.instanceOf(LogicCalculation).isRequired,
  onlyProgressLocations: PropTypes.bool.isRequired,
  setOpenedLocation: PropTypes.func.isRequired,
  setSelectedItem: PropTypes.func.isRequired,
  setSelectedLocation: PropTypes.func.isRequired,
  trackerState: PropTypes.instanceOf(TrackerState).isRequired,
};

export default SeaChart;
