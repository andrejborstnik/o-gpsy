// models

// backend

// import subcomponents

// import libraries
import L from 'leaflet';

// defining types

/**
 * Handling an orienteer.
 */
class Orienteer {
    constructor(live, i, props, map) {
        // remembering pointer to the Live component
        this.parent = live;

        // handling inherited props of a user
        this.props = props;
        this.track_data = this.props.track;
        this.i = i;

        // handling map related issues
        this.color = this.getColor(i);
        this.map = map;

        this.tail_length = 120; // TODO: this should be inherited from parent (used "live")

        // render marker and tail
        this.initMarkerAndTail();
    }

    /**
     * Creates initial marker and track (tail) objects for a competitor.
     */
    initMarkerAndTail() {
        // add tail
        this.track = L.polyline([], { color: this.color, weight: 6, opacity: 0.8 }).addTo(this.map);
        this.updateTrack();
        // add marker
        this.marker = L.circleMarker([0, 0], { radius: 6, color: "black", weight: 1, fillColor: this.color, fillOpacity: 1 })
            .bindTooltip(this.props.name, {
                permanent: false,
                direction: 'right',
                offset: new L.Point(10, 0)
            }).addTo(this.map);
    }

    /**
     * Updates marker. Currently called from Live component.
     */
    updateMarker() {
        if (this.marker) {
            const len = this.track_data.length;
            if (len > 0) {
                let lat_lng = new L.LatLng(this.track_data[len - 1].lat, this.track_data[len - 1].lon);
                this.marker.setLatLng(lat_lng);
                this.track.addLatLng(lat_lng);
            }
        }
    }

    /**
     * Updates track. Currently called from Live component.
     */
    updateTrack() {
        if (this.track_data.length > 0) {
            // fill track
            let latlngs = this.track_data
                .filter(x => x.ts > this.parent.state.current_ts - this.tail_length)
                .map((el, i) => [el.lat, el.lon]);
            this.track.setLatLngs(latlngs);
        }
    }

    /**
     * Updates the internal track property with outside data.
     * @param {PointRecordObj} data New point data record.
     */
    update(data) {
        // this is acctually pointer
        let track = this.track_data;
        if (track.length > 0) {
            if (track[track.length - 1].ts) {
                if (track[track.length - 1].ts !== data.ts) {
                    track.push(data);
                }
            }
        } else {
            track.push(data);
        };
    }

    /**
     * Returns the color of the marker/tail.
     * @param {number} i Number of the current competitor in the event.
     */
    getColor(i) {
        const colors = [
            "red",
            "blue",
            "green",
            "maroon",
            "yellow",
            "olive",
            "lime",
            "teal",
            "navy",
            "fuchsia",
            "purple",
            "silver",
        ];

        return colors[i % colors.length];
    }

}

export default Orienteer;