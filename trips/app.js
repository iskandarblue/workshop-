/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import moment from 'moment';
import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaXNrYW5kYXJibHVlIiwiYSI6ImNpazE3MTJldjAzYzZ1Nm0wdXZnMGU2MGMifQ.i3E1_b9QXJS8xXuPy3OTcg"; // eslint-disable-line

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://cdn.rawgit.com/iskandari/workshop-/0e42c300/best.json' // eslint-disable-line
};

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      buildings: null,
      trips: null,
      time: 0,
      displayTime: '06:00:00'
    };

    requestJson(DATA_URL.BUILDINGS, (error, response) => {
      if (!error) {
        this.setState({buildings: response});
      }
    });

    requestJson(DATA_URL.TRIPS, (error, response) => {
      if (!error) {
        this.setState({trips: response});
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const currentTime = this.state.time || 0;
    const maxTime =  64800;
    const loopTime = 90;
    const fps = 24;
    const step = Math.ceil((maxTime / loopTime) / fps); // 42

    const viewport = this.state.viewport;
    var self = this;

    viewport.bearing = this.state.viewport.bearing + .05;
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;

    var time = currentTime + step;
    if (time > maxTime) {
      time = 0;
    }
    var displayTime = moment().hour(6).minute(0).seconds(time);
    console.log(displayTime);

    this.setState({
      time: time,
      displayTime: displayTime.format("H:mm:ss"),
      viewport: viewport
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport, buildings, trips, time} = this.state;

    return (
       <div>
       <div
        style={{
          position: 'absolute',
          top: '100px',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Verdana, Geneva, sans-serif',
          color: '#ccc',
          zIndex: 1
        }}>{ this.state.displayTime } PST</div>
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/iskandarblue/cjdy1weid7js02spi6eb47pfs"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <DeckGLOverlay
          viewport={viewport}
          buildings={buildings}
          trips={trips}
          trailLength={540}
          time={time}
        />
      </MapGL>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
